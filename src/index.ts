import { getResponse } from "./services/openAIservice";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { getOctokit } from "./services/octokitService";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";


async function init() {
    const prFiles = await getOctokit().getPullRequestFiles();
    const context = await getOctokit().getContext();
    prFiles.map(async x => {
        const prFilesContent = await getOctokit().getFileContent(x);
        const contentDecoded = Buffer.from(prFilesContent.content, "base64").toString('utf-8');
        const data = await getResponse(contentDecoded);
        const parsedData = data.choices[0].message.content
        await getOctokit().postComment(context, x.filename, parsedData);
        // core.info(JSON.stringify(data).split("\n").join(" "));
    })
}

init();