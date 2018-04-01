import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

import { getPoolsForWeapon, sortByParry } from '.'
import * as calc from '../utils/calculated/'

const getState = (state) => state
const getCurrentPlayer = (state) => state.entities.players[state.session.id]

//const characterCount = (state) => state.entities.characters.length
export const getSpecificCharacter = (state, id) => state.entities.characters[id]
const characterIdMemoizer = (state, id) => id
export const getCachedSpecificCharacter = createCachedSelector(
  [getSpecificCharacter],
  (character) => character
)(characterIdMemoizer)


const getMerits = (state) => state.entities.merits
export const getMeritsForCharacter = createCachedSelector(
  [getSpecificCharacter, getMerits],
  (character, merits) => character.merits.map((m) => merits[m])
)(characterIdMemoizer)
export const getMeritNamesForCharacter = (state, id) => getMeritsForCharacter(state, id).map((m) => m.merit_name.toLowerCase() + m.rating)
export const getEvokableMeritsForCharacter = createSelector(
  [getMeritsForCharacter],
  (merits) => merits.filter((m) =>
    m.merit_name.toLowerCase() == 'artifact' || m.merit_name.toLowerCase() == 'hearthstone'
  )
)

const getWeapons = (state) => state.entities.weapons
export const getWeaponsForCharacter = createCachedSelector(
  [getSpecificCharacter, getWeapons],
  (character, weapons) => character.weapons.map((w) => weapons[w])
)(characterIdMemoizer)

const getCharms = (state) => state.entities.charms
export const getNativeCharmsForCharacter = createCachedSelector(
  [getSpecificCharacter, getCharms],
  (character, charms) => character.charms !== undefined ? character.charms.map((c) => charms[c]) : []
)(characterIdMemoizer)
export const getMartialArtsCharmsForCharacter = createCachedSelector(
  [getSpecificCharacter, getCharms],
  (character, charms) => character.martial_arts_charms !== undefined ? character.martial_arts_charms.map((c) => charms[c]) : []
)(characterIdMemoizer)
export const getEvocationsForCharacter = createCachedSelector(
  [getSpecificCharacter, getCharms],
  (character, charms) => character.evocations !== undefined ? character.evocations.map((c) => charms[c]) : []
)(characterIdMemoizer)
export const getSpiritCharmsForCharacter = createCachedSelector(
  [getSpecificCharacter, getCharms],
  (character, charms) => character.spirit_charms !== undefined ? character.spirit_charms.map((c) => charms[c]) : []
)(characterIdMemoizer)
export const getAllAbilitiesWithCharmsForCharacter = createCachedSelector(
  [getNativeCharmsForCharacter, getMartialArtsCharmsForCharacter],
  (charms, maCharms) => {
    let abilities = [ ...new Set(charms.map((c) => c.ability))]

    if (maCharms.length > 0)
      abilities = abilities.concat(['martial_arts'])

    return abilities
  }
)(characterIdMemoizer)

const getSpells = (state) => state.entities.spells
export const getSpellsForCharacter = createCachedSelector(
  [getSpecificCharacter, getSpells],
  (character, spells) => character.spells.map((s) => spells[s])
)(characterIdMemoizer)
export const getControlSpellsForCharacter = (state, id) => getSpellsForCharacter(state, id).filter((s) => s.control)

export const getPenalties = createCachedSelector(
  [getSpecificCharacter, getMeritsForCharacter],
  (character, merits) => {
    const meritNames = merits.map((m) => m.merit_name.toLowerCase() + m.rating)
    return {
      mobility: calc.mobilityPenalty(character, meritNames),
      onslaught: character.onslaught,
      wound: calc.woundPenalty(character, meritNames),
    }
  }
)(characterIdMemoizer)

export const getPoolsForAllWeaponsForCharacter = createSelector(
  [getSpecificCharacter, getState],
  (character, state) => character.weapons.map((id) => getPoolsForWeapon(state, id))
)

export const getPoolsAndRatings = createCachedSelector(
  [
    getSpecificCharacter,
    getMeritNamesForCharacter,
    getAllAbilitiesWithCharmsForCharacter,
    getControlSpellsForCharacter,
    getPenalties,
    getPoolsForAllWeaponsForCharacter
  ],
  (character, meritNames, charmAbils, spells, penalties, weaponPools) => {
    const spellNames = spells.map((m) => m.name.toLowerCase())

    const bestParryWeapon = weaponPools.sort(sortByParry)[0] || { parry: { total: 0 }}

    return {
      guile: calc.guile(character, meritNames, penalties, charmAbils),
      resolve: calc.resolve(character, meritNames, penalties, charmAbils),
      appearance: calc.appearanceRating(character, meritNames, penalties, charmAbils),
      readIntentions: calc.readIntentions(character, meritNames, penalties, charmAbils),

      evasion: calc.evasion(character, meritNames, penalties, charmAbils),
      bestParry: bestParryWeapon.parry,
      soak: calc.soak(character, meritNames, spellNames),
      hardness: { total: calc.hardness(character) },
      joinBattle: calc.joinBattle(character, meritNames, penalties, charmAbils),
      rush: calc.rush(character, meritNames, penalties, charmAbils),
      disengage: calc.disengage(character, meritNames, penalties, charmAbils),
      withdraw: calc.withdraw(character, meritNames, penalties, charmAbils),
      riseFromProne: calc.riseFromProne(character, meritNames, penalties, charmAbils),
      takeCover: calc.takeCover(character, meritNames, penalties, charmAbils),

      featOfStrength: calc.featOfStrength(character, meritNames, penalties, charmAbils),
      shapeSorcery: calc.shapeSorcery(character, meritNames, penalties, charmAbils),
    }
  }
)(characterIdMemoizer)

export const canIEditCharacter = createSelector(
  [getCurrentPlayer, getSpecificCharacter, getState],
  (player, character, state) => {
    if (character === undefined)
      return false

    if (player.id === character.player_id)
      return true

    if (
      character.chronicle_id &&
      state.entities.chronicles[character.chronicle_id] &&
      state.entities.chronicles[character.chronicle_id].st_id === player.id
    )
      return true

    return false
  }
)

export const canIDeleteCharacter = createSelector(
  [getCurrentPlayer, getSpecificCharacter],
  (player, character) => (player.id === character.player_id)
)
