information(content, fields) {
    const embed = new EmbedBuilder()
        .setColor(strings.embeds.color)
        .setTitle('Information')
        .setDescription(content)
        .setFooter({ text: `v${package.version} - ${strings.embeds.footer}` });
    if (fields) embed.addFields(fields);
    const messageContents = { embeds: [embed], ephemeral: true };
    return messageContents;
}

replyContent = `I estimate that a tree with ${efficiency}% Composter Efficiency and ${quality}% Compost Quality growing from ${beginHeight}ft to ${endHeight}ft will take ${time}`;
replyFields = [
    { name: `Start Height:`, value: `**${beginHeight}ft**`, inline: true },
    { name: `End Height:`, value: `**${endHeight}**`, inline: true },
    { name: `Efficiency:`, value: `**${efficiency}%**`, inline: true },
    { name: `Quality:`, value: `**${quality}%**`, inline: true },
    { name: `Summary`, value: `Compost Applied **${compostAppliedCount}** times, out of **${totalWaterCount}** waterings, for an average of **${average}%**` }
];

const reply = information(replyContent, replyFields);