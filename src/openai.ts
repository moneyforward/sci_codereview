import * as core from "@actions/core";
import OpenAI from "openai";
import {File} from "parse-diff";
import {createCodeReviewPrompt} from "./prompt";
import {createComment} from "./github";
import {PRDetails} from "./types";

const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export async function getAIResponse(prompt: string): Promise<Array<{
    lineNumber: string;
    reviewComment: string;
}> | null> {
    const queryConfig = {
        model: OPENAI_API_MODEL,
        temperature: 0.2,
        max_tokens: 700,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    };

    try {
        const response = await openai.chat.completions.create({
            ...queryConfig,
            // return JSON if the model supports it:
            ...(OPENAI_API_MODEL === "gpt-4-1106-preview"
                ? { response_format: { type: "json_object" } }
                : {}),
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
            ],
        });

        var res = response.choices[0].message?.content?.trim() || "{}";
        if (!isJSON(res)) {
            return [{
                "lineNumber": "1",
                "reviewComment": res
            }]
        }

        return JSON.parse(res).reviews;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

export async function analyzeCode(
    parsedDiff: File[],
    prDetails: PRDetails
): Promise<Array<{ body: string; path: string; line: number }>> {
    const comments: Array<{ body: string; path: string; line: number }> = [];

    for (const file of parsedDiff) {
        if (file.to === "/dev/null") continue; // Ignore deleted files
        for (const chunk of file.chunks) {
            const prompt = createCodeReviewPrompt(file, chunk, prDetails);
            const aiResponse = await getAIResponse(prompt);
            if (aiResponse) {
                const newComments = createComment(file, chunk, aiResponse);
                if (newComments) {
                    comments.push(...newComments);
                }
            }
        }
    }
    return comments;
}
function isJSON(text: string) {
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}