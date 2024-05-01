/**
 *  method to call ChatGPT API
 */

const { CHATGPT_KEY } = require("./config");
const { OpenAI } = require('openai');
const { ExpressError, NotFoundError, BadRequestError, UnauthorizedError }= require("./expressError");
const openai = new OpenAI({ apiKey: CHATGPT_KEY });

    /**
     * Retrieve recipe from ChatGPT API -- returns 
     * {title, total_time, instructions}
     * 
     *  ingredients: {ingredient_1: value,...}
     */
async function callChatGPT(ingredients) {
    try {
        // Convert ingredients JSON obj to a string as "prompt" then send to openai
        const recipeArr = Object.values(ingredients);
        /* console.log(`recipeArr is ${recipeArr}`); */
        const prompt = recipeArr.join(", ");
        /* console.log(`prompt is ${prompt}`); */
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role:"system",
                    content: "Act as a chef, create a health focused recipe with the given ingredients and return in JSON having properties title, ingredients, total_time and instructions. Have the instructions remain as a giant string to be delimited by \n",
                },
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object"},
        });
        // convert response to JSON and check if valid
        const recipeObject = JSON.parse(response.choices[0].message.content);
        if (!recipeObject){
            throw new BadRequestError("ChatGPT response did not contain valid JSON");
        };
        /* console.log(recipeObject); */

        /* console.log(`recipe results is ${JSON.stringify(results.rows[0])}`); */

        return recipeObject;
    } catch (err) {
        console.log("Error calling ChatGPT API")
        throw new BadRequestError("ChatGPT API request failed");
    }
};

module.exports = { callChatGPT };