import fetch from 'node-fetch';

const getPrompt = (code: string) => {
// Build the prompt for OpenAI API.
    return `Review the code below and provide feedback on how to optimize and improve it.

    ${code}
    `
}
    
const getResponse = async (data: string) => {
    const prompt = getPrompt(data);
    const username = "global-hackathon-gap-user-test";
    const password = "4wwEpAQE2ecRJIxg";
    const body = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    })
    const completion = await fetch(
        'https://generative-ai-proxy.rcp.us-east-1.data.test.exp-aws.net/v1/proxy/openai/v1/chat/completions',
        {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
              "Content-Type": "application/json",
              "Authorization": 'Basic ' + Buffer.from(username + ":" + password).toString('base64'),
            },
            body
        }
    )
    return completion.json();
};

export { getResponse }