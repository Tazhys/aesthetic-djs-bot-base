class Command {
    /**
     * Creates a new Command instance
     * @param {Object} config - Command configuration
     * @param {string} config.name - Command name
     * @param {string[]} config.triggers - Alternative command triggers
     * @param {boolean} config.dev_only - Whether command is developer-only
     * @param {string[]} config.permissions - Required user permissions
     * @param {string[]} config.bot_permissions - Required bot permissions
     * @param {Function} run - Command execution function
     */
    constructor({
        name,
        triggers = [],
        dev_only = false,
        permissions = [],
        bot_permissions = []
    }, run = function (message, args) { return 'command.incomplete' }) {

        this.run = run
        this.name = name
        this.dev_only = dev_only
        this.triggers = [name, ...triggers]
        this.permissions = permissions
        this.bot_permissions = bot_permissions
    }

    /**
     * Extracts command arguments from a message
     * @param {Message} message - Discord message object
     * @param {string} usedPrefix - The prefix that was used
     * @returns {Object} Object containing args array and command string
     */
    static getArgs(message, usedPrefix) {
        const { content } = message
        const prefixLength = usedPrefix?.length || process.env.PREFIX?.length || 1
        const args = content.slice(prefixLength).trim().split(/ +/g)
        const command = args.shift().toLowerCase()
        return { args, command }
    }

    /**
     * Checks if a message is using the specified prefix
     * @param {Message} message - Discord message object
     * @param {string} usedPrefix - The prefix to check
     * @param {boolean} isMentioningBot - Whether the bot is being mentioned
     * @returns {boolean} True if using prefix, false otherwise
     */
    static isUsingPrefix(message, usedPrefix, isMentioningBot = false) {
        const { content } = message

        // If bot is mentioned, prefix check is bypassed
        if (isMentioningBot) {
            return true
        }

        // Check if message starts with the prefix
        return content.toLowerCase().trim().startsWith(usedPrefix.toLowerCase().trim())
    }

    /**
     * Checks if a user is allowed to execute a command
     * @param {Message} message - Discord message object
     * @param {Command} command - Command instance to check
     * @returns {boolean|string} True if allowed, error message string if not
     */
    static isAllowed(message, command) {
        const { member, guild } = message

        // Validate required objects exist
        if (!member || !guild) {
            return 'Unable to verify permissions in this context.'
        }

        // Check if user is a developer (developers bypass all restrictions)
        const developers = process.env.DEVELOPERS?.split(',') || []
        if (developers.includes(member.id)) {
            return true
        }

        // Check if command is developer-only
        if (command.dev_only) {
            return 'This command is for developers only.'
        }

        // Check bot permissions first (if bot can't execute, no point checking user perms)
        if (command.bot_permissions.length > 0) {
            const missingBotPerms = command.bot_permissions.filter(perm =>
                !guild.me.hasPermission(perm)
            )

            if (missingBotPerms.length > 0) {
                return `I'm missing the following permissions: ${missingBotPerms.join(', ')}`
            }
        }

        // Check user permissions
        if (command.permissions.length > 0) {
            const missingUserPerms = command.permissions.filter(perm =>
                !member.hasPermission(perm)
            )

            if (missingUserPerms.length > 0) {
                return `You're missing the following permissions: ${missingUserPerms.join(', ')}`
            }
        }

        // If we reach here, the user is allowed to execute the command
        return true
    }

    /**
     * Validates command configuration
     * @returns {boolean|string} True if valid, error message if invalid
     */
    validate() {
        if (!this.name || typeof this.name !== 'string') {
            return 'Command must have a valid name'
        }

        if (!Array.isArray(this.triggers)) {
            return 'Command triggers must be an array'
        }

        if (!Array.isArray(this.permissions)) {
            return 'Command permissions must be an array'
        }

        if (!Array.isArray(this.bot_permissions)) {
            return 'Command bot_permissions must be an array'
        }

        if (typeof this.run !== 'function') {
            return 'Command must have a run function'
        }

        return true
    }
}

module.exports = Command
