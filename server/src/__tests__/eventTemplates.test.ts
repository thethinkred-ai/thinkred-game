import { getEventChoices, buildGameEventFromRow } from '../utils/eventTemplates';

describe('eventTemplates', () => {
  it('returns choices for economic crisis', () => {
    const choices = getEventChoices('economic_crisis');
    expect(choices.length).toBe(3);
    expect(choices[0].id).toBe('cut_production');
  });

  it('returns choices for labor conflict', () => {
    const choices = getEventChoices('labor_conflict');
    expect(choices.length).toBe(2);
  });

  it('parses choices from stored JSON', () => {
    const event = buildGameEventFromRow({
      id: 'evt1',
      event_type: 'economic_crisis',
      title: 'Test',
      description: 'Desc',
      period: 'feudalism',
      year: 2024,
      choices_json: JSON.stringify([{ id: 'a', text: 'A', description: '', requiredKnowledge: [], economicImpact: { gdpChange: 0, unemploymentChange: 0, profitRateChange: 0, concentrationChange: 0, crisisRiskChange: 0 }, socialImpact: { classConsciousness: {}, workerSatisfaction: 0, socialStability: 0, educationLevel: 0 }, politicalImpact: { governmentSupport: 0, revolutionaryPotential: 0, reformMovement: 0, repressionLevel: 0 } }]),
    });
    expect(event.choices).toHaveLength(1);
    expect(event.choices[0].id).toBe('a');
  });
});
