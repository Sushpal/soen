const aiService = require('../services/ai.service')


/**
 * Get AI result
 * GET /api/ai/get-result
 */
async function getResult(req, res) {

    const { prompt } = req.query

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({
            message: 'Prompt is required'
        })
    }

    try {

        const result = await aiService.generateResult(prompt)

        return res.status(200).json({
            result
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


module.exports = { getResult }