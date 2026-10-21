FROM node:22-bookworm-slim AS node
FROM mcr.microsoft.com/dotnet/sdk:10.0.402 AS build
COPY --from=node /usr/local/ /usr/local/
WORKDIR /workspace
COPY . .
RUN dotnet publish Keas.Mvc --configuration Release --output /output/app \
    && dotnet publish Keas.DbTool --configuration Release --output /output/dbtool

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS app
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /home/app/.aspnet/DataProtection-Keys \
    && chown -R app:app /home/app/.aspnet
COPY --from=build /output /app
WORKDIR /app/app
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Keas.Mvc.dll"]
