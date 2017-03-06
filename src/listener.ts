import { createServer, Socket, Server } from 'net';
import { TextEditor, Position } from 'vscode';
import * as formatDate from 'date-format';

export class Listener {
    private connectedClients: Socket[] = [];
    private server: Server;

    constructor(private editor: TextEditor, private port: number, private hostname: string) {
        this.server = createServer(async (socket) => {
            await this.notifyClientConnected(socket);

            socket.on("data", async (data) => {
                await this.notify(`Received message from ${socket.remoteAddress}:${socket.remotePort}:`);
                await this.print(`\n-------------------- MESSAGE START --------------------\n`);
                await this.print(`\n${data.toString()}\n`);
                await this.print(`\n--------------------- MESSAGE END ---------------------\n\n`);
            });

            socket.on("end", async () => {
                await this.notifyClientDisconnected(socket);
            });
        });

        this.server.on("listening", () => {
            this.notify("Listener started");
        })
        this.server.on("error", (err) => {
            this.notify(`Listener error: ${err.message}`);
        });
        this.server.on("close", () => {
            this.notify("Listener stopped");
        });

        this.server.listen(this.port, this.hostname);
    }

    public async verboseKill() {
        await this.notify("Killing listener");
        this.kill();
    }

    public kill() {
        this.server.close();
    }

    private notify(msg: string) {
        let time = new Date();
        let formattedTime = formatDate("yyyy-MM-dd hh:mm:ss:SSS");
        return this.print(`${formattedTime}: ${msg}\n`);
    }

    private print(msg: string) {
        return this.editor.edit(builder => {
            let pos = new Position(this.editor.document.lineCount + 1, 0);
            builder.insert(pos, msg);
        });
    }

    private notifyClientConnected(socket: Socket) {
        return this.notify(`New client connected (${socket.remoteAddress}:${socket.remotePort})`);
    }

    private notifyClientDisconnected(socket: Socket) {
        return this.notify(`Client disconnected (${socket.remoteAddress}:${socket.remotePort})`);
    }
}