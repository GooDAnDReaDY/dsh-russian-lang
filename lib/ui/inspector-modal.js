export function buildProposalPayload(meta, originalText, proposedText, comment, version) {
  const m = meta || {}
  const orig = originalText || m.origText || m.rawText || ''
  return {
    isProposal: true,
    title: `[Предложение] ${m.ns || 'интерфейс'}: ${m.key || orig}`,
    origText: orig,
    currentTranslation: m.currentTranslation || orig,
    proposal: proposedText || '',
    comment: comment || '',
    ns: m.ns || '',
    key: m.key || '',
    plugin: m.plugin || '',
    version: version || '0.4.17'
  }
}
