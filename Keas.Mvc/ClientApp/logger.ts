import {
    AjaxAppender,
    BrowserConsoleAppender,
    getLogger,
    JsonLayout,
    Logger,
    logLog
} from "log4javascript";
import * as StackTrace from "stacktrace-js";

const __DEV__: boolean = false;

const logger = getLogger();

// disable user alerts for loglog errors in production
if (!__DEV__) {
    logLog.setQuietMode(true);
}

// setup console sink
const consoleSink = new BrowserConsoleAppender();
logger.addAppender(consoleSink);

// setup server log sink
const host = location.origin || `${location.protocol}//${location.host}`;
const ajaxSink = new AjaxAppender(`${host}/log/SendLogMessage`, true);
const ajaxLayout = new JsonLayout(true, true);
ajaxSink.setLayout(ajaxLayout);
ajaxSink.addHeader("Content-Type", "application/json");
ajaxSink.setSendAllOnUnload(true);
logger.addAppender(ajaxSink);

// add global listener
window.addEventListener("error", async event => {
    const stack = await StackTrace.fromError(event.error);
    const message = `${event.message}\r\n${JSON.stringify(stack)}`;
    logger.error(message, event.error);
});

// add global to window
export interface ILoggerWindow extends Window {
    $logger?: Logger;
}

const loggerWindow: ILoggerWindow = window;
loggerWindow.$logger = logger;

export default logger;
