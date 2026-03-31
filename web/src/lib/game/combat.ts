/** Risk-style dice: attacker up to 3, defender up to 2; sorted high to low. */

function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

export function rollCombat(attackerArmies: number, defenderArmies: number) {
  const attCount = Math.min(3, Math.max(0, attackerArmies - 1));
  const defCount = Math.min(2, defenderArmies);
  const att: number[] = [];
  const def: number[] = [];
  for (let i = 0; i < attCount; i++) att.push(rollDie());
  for (let i = 0; i < defCount; i++) def.push(rollDie());
  att.sort((a, b) => b - a);
  def.sort((a, b) => b - a);
  let attLoss = 0;
  let defLoss = 0;
  const pairs = Math.min(att.length, def.length);
  for (let i = 0; i < pairs; i++) {
    if (att[i] > def[i]) defLoss++;
    else attLoss++;
  }
  return { att, def, attLoss, defLoss };
}
