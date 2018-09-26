import gulp     from 'gulp';
import plugins  from 'gulp-load-plugins';
import browser  from 'browser-sync';
import rimraf   from 'rimraf';
import panini   from 'panini';
import yargs    from 'yargs';
import lazypipe from 'lazypipe';
import inky     from 'inky';
import fs       from 'fs';
import siphon   from 'siphon-media-query';
import path     from 'path';
import merge    from 'merge-stream';
import beep     from 'beepbeep';
import colors   from 'colors';
import cheerio  from 'cheerio';
import sparkpost from 'sparkpost';
import azureStorage from 'azure-storage';

const $ = plugins();

// Look for the --production flag
const PRODUCTION = !!(yargs.argv.production);
const EMAIL = yargs.argv.to;

// Declar var so that Azure and Sparkpost can use it.
let CONFIG;

const configPath = './config.json';
try {
  CONFIG = JSON.parse(fs.readFileSync(configPath));
} catch(e) {
  beep();
  console.log('[CONFIG]'.bold.red + ' Sorry, there was an issue locating your config.json. Please see README.md');
  process.exit();
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
  gulp.series(clean, pages, sass, images, inline, azure));

// Build emails, then send to litmus
gulp.task('litmus',
  gulp.series('build', litmus));

// Build emails, then send to EMAIL
gulp.task('mail',
  gulp.series('build', mail));

// Build emails, then zip
gulp.task('zip',
  gulp.series('build', zip));

gulp.task('preview',
  gulp.series('build', preview));

// Build emails, run the server, and watch for file changes
gulp.task('default',
  gulp.series('preview', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf('dist', done);
}

// Compile layouts, pages, and partials into flat HTML files
// Then parse using Inky templates
function pages() {
  return gulp.src(['src/pages/**/*.html', '!src/pages/archive/**/*.html'])
    .pipe(panini({
      root: 'src/pages',
      layouts: 'src/layouts',
      partials: 'src/partials',
      helpers: 'src/helpers'
    }))
    .pipe(inky())
    .pipe(gulp.dest('dist'));
}

// Reset Panini's cache of layouts and partials
function resetPages(done) {
  panini.refresh();
  done();
}

// Compile Sass into CSS
function sass() {
  return gulp.src('src/assets/scss/app.scss')
    .pipe($.if(!PRODUCTION, $.sourcemaps.init()))
    .pipe($.sass({
      includePaths: ['node_modules/foundation-emails/scss'],
    }).on('error', $.sass.logError))
    .pipe($.if(PRODUCTION, $.uncss(
      {
        html: ['dist/**/*.html']
      })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest('dist/css'));
}

// Copy and compress images
function images() {
  return gulp.src(['src/assets/img/**/*', '!src/assets/img/archive/**/*'])
    .pipe($.imagemin())
    .pipe(gulp.dest('./dist/assets/img'));
}

// Inline CSS, swap external URL, and minify HTML
function inline() {
  const azureURL = !!CONFIG && !!CONFIG.azure && !!CONFIG.azure.url ? CONFIG.azure.url : false;

  return gulp.src('dist/**/*.html')
    .pipe($.if(PRODUCTION, inliner('dist/css/app.css')))
    .pipe($.if(!!azureURL, $.replace(/=('|")(\/?assets\/img)/g, '=$1' + azureURL)))
    .pipe(gulp.dest('dist'));
}

// Start a server with LiveReload to preview the site in
function server(done) {
  browser.init({
    server: 'dist',
  });
  done();
}

// Watch for file changes
function watch() {
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, inline, preview, browser.reload));
  gulp.watch(['src/layouts/**/*', 'src/partials/**/*']).on('all', gulp.series(resetPages, pages, inline, preview, browser.reload));
  gulp.watch(['../scss/**/*.scss', 'src/assets/scss/**/*.scss']).on('all', gulp.series(resetPages, sass, pages, inline, preview, browser.reload));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, preview, browser.reload));
  gulp.watch('etc/data/**/*.json').on('all', gulp.series(preview, browser.reload));
}

// Inlines CSS into HTML, adds media query CSS into the <style> tag of the email, and compresses the HTML
function inliner(css) {
  var css = fs.readFileSync(css).toString();
  const mqCss = siphon(css);

  const pipe = lazypipe()
    .pipe($.inlineCss, {
      applyStyleTags: false,
      removeStyleTags: true,
      preserveMediaQueries: true,
      removeLinkTags: false,
    })
    .pipe($.replace, '<!-- <style> -->', `<style>${mqCss}</style>`)
    .pipe($.replace, '<link rel="stylesheet" type="text/css" href="css/app.css">', '')
	.pipe($.replace, '@media', '@@media')
    .pipe($.htmlmin, {
      collapseWhitespace: true,
      minifyCSS: true,
    });

  return pipe();
}

// Post images to Azure Blob Storage so they are accessible to emails
function azure() {
  if (!CONFIG.azure) return Promise.resolve();

  const blobService = azureStorage.createBlobService(CONFIG.azure.accountName, CONFIG.azure.accountKey);

  const dir = path.join(__dirname, './dist/assets/img');
  const tasks = fs.readdirSync(dir)
    .filter((filename) => {
      const file = path.join(dir, filename);
      return fs.statSync(file).isFile();
    })
    .map(filename => new Promise((r, x) => {
      blobService.createBlockBlobFromLocalFile(
        CONFIG.azure.containerName,
        filename,
        path.join(dir, filename),
        (err, result, response) => {
          if (err) return x(err);
          console.log('[AZURE]', result);
          return r(result);
        });
    }));

  return Promise.all(tasks);
}

// Send email to Litmus for testing. If no Azure creds then do not replace img urls.
function litmus() {
  return gulp.src('dist/**/*.html')
    .pipe($.litmus(CONFIG.litmus))
    .pipe(gulp.dest('dist'));
}

// Send email to specified email for testing. If no Azure creds then do not replace img urls.
function mail() {
  if (EMAIL) {
    CONFIG.mail.to = [EMAIL];
  }

  return gulp.src('dist/**/*.html')
    .pipe($.mail(CONFIG.mail))
    .pipe(gulp.dest('dist'));
}

function getHtmlFiles(dir) {
  const ext = '.html';
  return fs.readdirSync(dir)
    .filter((file) => {
      const fileExt = path.join(dir, file);
      const isHtml = path.extname(fileExt) === ext;
      return fs.statSync(fileExt).isFile() && isHtml;
    });
}

// Copy and compress into Zip
function zip() {
  const dist = 'dist';
  const ext = '.html';

  const htmlFiles = getHtmlFiles(dist);

  const moveTasks = htmlFiles.map((file) => {
    const sourcePath = path.join(dist, file);
    const fileName = path.basename(sourcePath, ext);

    const moveHTML = gulp.src(sourcePath)
      .pipe($.rename(function (path) {
        path.dirname = fileName;
        return path;
      }));

    const moveImages = gulp.src(sourcePath)
      .pipe($.htmlSrc({ selector: 'img'}))
      .pipe($.rename(function (path) {
        path.dirname = fileName + path.dirname.replace('dist', '');
        return path;
      }));

    return merge(moveHTML, moveImages)
      .pipe($.zip(fileName + '.zip'))
      .pipe(gulp.dest('dist'));
  });

  return merge(moveTasks);
}

function getTemplate(dir, filename) {
  let html = fs.readFileSync(path.join(__dirname, dir, filename), 'utf-8');

  const azureURL = !!CONFIG && !!CONFIG.azure && !!CONFIG.azure.url ? CONFIG.azure.url : false;
  if (!!azureURL) {
    html = html.replace(/(=|url\()('|")?(\/?assets\/img)/g, '$1$2'+ azureURL);
  }

  const dom = cheerio.load(html);

  const id = dom('meta[name="id"]').attr('content');
  const name = dom('meta[name="name"]').attr('content');
  const subject = dom('title').text();

  const template = {
    id,
    name,
    content: {
      subject,
      html,
    },
  };

  // build from info
  const fromEmail = dom('meta[name="from_email"]').attr('content');
  if (fromEmail) {
    template.content.from = fromEmail;
  } else {
    template.content.from = 'donotreply@payments-mail.ucdavis.edu';
  }

  const fromName = dom('meta[name="from_name"]').attr('content');
  if (fromName) {
    template.content.from = {
      name: fromName,
      email: template.content.from,
    };
  }

  // build reply info
  const replyEmail = dom('meta[name="reply_email"]').attr('content');
  if (replyEmail) {
    template.content.reply_to = replyEmail;
  }

  return template;
}

function getSubstitutionFiles(dir) {
  const ext = '.json';
  return fs.readdirSync(dir)
    .filter((file) => {
      const fileExt = path.join(dir, file);
      const isJson = path.extname(fileExt) === ext;
      return fs.statSync(fileExt).isFile() && isJson;
    });
}

function preview() {
  if (!CONFIG.sparkpost) {
    return Promise.resolve();
  }

  const key = CONFIG.sparkpost.apikey;
  const client = new sparkpost(key);
  const options = {
    update_published: false,
  };

  let dist = path.join(__dirname, 'dist');
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  dist = path.join(dist, 'preview');
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }

  const dir = './etc/data';
  const tasks = getSubstitutionFiles(dir).map(s => {
    const id = s.replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, dir, s)));
    const template = getTemplate('dist', `${id}.html`);

    template.id = 'preview';
    template.name = 'preview';

    // first upload the template
    return client.templates.update('preview', template)
      .then(result => {
        console.log(result);
        return client.templates.preview('preview', {
          draft: true,
          substitution_data: data,
        });
      })
      .then(result => {
        // write files to dist
        fs.writeFileSync(path.join(dist, `${id}.html`), result.results.html);
      })
      .catch(err => console.log(err));
  });

  return Promise.all(tasks);

}