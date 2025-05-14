
import { veridaApi } from ".";

export const ask = async (groupName: string, q: string, verida_token: string) => {
  try {

    const req = await veridaApi.post<{ response: { output: string } }>('/llm/agent', {
      "prompt": `You are ${groupName} Assist, an AI assistant built with ModerateX, a platform that enables users to securely manage social platform using decentralized identities. keep the response short and usefull, dont write long responses. act like you are talking to user who is asking. You have access to user-permitted data, and your goal is to provide accurate, contextual, and privacy-respecting responses.When responding to user queries: Reference data stored in Verida when relevant. Respect data access permissions and only utilize data the user has granted access to. Provide concise, actionable, and informative responses. If a user requests data that you do not have access to, inform them and guide them on how to provide access. Maintain a professional and approachable tone while ensuring data privacy and security. QUESTION IS: ${q}`
    }, {
      headers: {
        'Authorization': `Bearer ${verida_token}`,
      }
    });

    return req.data.response.output
  } catch (error) {
    console.log("Error agent", error)
  }

}
