import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server = new Server(
    {
        name: "agente-analista-sql",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Define available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_assessment",
                description: "Crea una nueva evaluación de madurez empresarial",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        tenantId: { type: "string" },
                        courseId: { type: "string" },
                        questions: { type: "array", items: { type: "object" } },
                    },
                    required: ["title", "tenantId", "questions"],
                },
            },
            {
                name: "submit_answers",
                description: "Registra las respuestas de un estudiante a una evaluación",
                inputSchema: {
                    type: "object",
                    properties: {
                        assessmentId: { type: "string" },
                        studentName: { type: "string" },
                        studentEmail: { type: "string" },
                        responses: { type: "object" },
                    },
                    required: ["assessmentId", "studentName", "studentEmail", "responses"],
                },
            },
            {
                name: "query_assessments",
                description: "Ejecuta una consulta en lenguaje natural sobre la base de datos de evaluaciones",
                inputSchema: {
                    type: "object",
                    properties: {
                        nlQuery: { type: "string", description: "La pregunta en lenguaje natural" },
                    },
                    required: ["nlQuery"],
                },
            },
        ],
    };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "create_assessment") {
            const { title, tenantId, courseId, questions } = args as any;
            const assessment = await prisma.assessment.create({
                data: { title, tenantId, courseId, questions },
            });
            return { content: [{ type: "text", text: `Evaluación creada con ID: ${assessment.id}` }] };
        }

        if (name === "submit_answers") {
            const { assessmentId, studentName, studentEmail, responses } = args as any;
            const answer = await prisma.answer.create({
                data: { assessmentId, studentName, studentEmail, responses },
            });
            return { content: [{ type: "text", text: `Respuestas registradas con ID: ${answer.id}` }] };
        }

        if (name === "query_assessments") {
            const { nlQuery } = args as any;

            // Placeholder for NL-to-SQL logic
            // In a real implementation, this would call an LLM to generate SQL based on nlQuery and schema
            const mockSQL = `SELECT * FROM Diagnosis WHERE studentEmail LIKE '%${nlQuery.split(' ').pop()}%'`;

            return {
                content: [
                    {
                        type: "text",
                        text: `He interpretado tu consulta: "${nlQuery}".\nGenerated SQL: ${mockSQL}\nNota: Esta es una respuesta simulada.`
                    }
                ]
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
