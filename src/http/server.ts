import { promisify } from 'util';
import { createServer, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import express, { Application } from 'express';
import { server as WebSocketServer, connection as Connection } from 'websocket';
import { logger } from '../logger';
import { setRoutes } from './routes';

export class Server {
  app: Application;
  httpServer: HttpServer;
  wsServer: WebSocketServer;
  wsConnection?: Connection;

  constructor() {
    this.app = this.createApp();
    this.httpServer = this.createServer();
    this.wsServer = this.createWebSocketServer();
    setRoutes(this.app);
  }

  async start(port: number) {
    const listen = promisify(this.httpServer.listen) as (port: number) => Promise<HttpServer>;
    await listen.call(this.httpServer, port);
  }

  async stop() {
    this.wsServer.shutDown();
    const close = promisify(this.httpServer.close);
    await close.call(this.httpServer);
  }

  private createApp() {
    const app = express();
    app.use(express.json());
    return app;
  }

  private createServer() {
    const server = createServer(this.app);
    server.on('listening', () => {
      const { port } = server.address() as AddressInfo;
      logger.log(`HTTP server started on port: ${port}`);
    });
    server.on('error', e => logger.error(e));
    server.on('close', () => logger.log(`HTTP server stopped.`));
    return server;
  }

  private createWebSocketServer() {
    const wsServer = new WebSocketServer({
      httpServer: this.httpServer,
      autoAcceptConnections: true, // todo: false
    });
    // todo:
    // wsServer.on('upgradeError', e => logger.error(e));
    wsServer.on('connect', connection => {
      logger.log(`WS: connection opened`);
      this.wsConnection?.close();
      this.wsConnection = connection;
    });
    wsServer.on('close', connection => {
      logger.log(`WS: connection closed`);
      if (this.wsConnection === connection) {
        this.wsConnection = undefined;
      }
    });
    return wsServer;
  }
}

export const server = new Server();
