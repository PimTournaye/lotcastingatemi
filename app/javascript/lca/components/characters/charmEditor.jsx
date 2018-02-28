import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import Grid from 'material-ui/Grid'
import ContentRemoveCircle from 'material-ui-icons/RemoveCircle'
import ContentAddCircle from 'material-ui-icons/AddCircle'
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography'
import { MenuItem } from 'material-ui/Menu'

import BlockPaper from '../generic/blockPaper.jsx'
import AbilitySelect from '../generic/abilitySelect.jsx'
import RatingField from '../generic/ratingField.jsx'
import { updateCharm, createCharm, destroyCharm } from '../../ducks/actions.js'
import { isAbilityCharm, abilitiesWithRatings } from '../../utils/calculated'
import { ABILITY_MAX, ESSENCE_MIN, ESSENCE_MAX } from '../../utils/constants.js'


class SingleCharmEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { charm: this.props.charm }

    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleRatingChange = this.handleRatingChange.bind(this)
    this.handleTimingChange = this.handleTimingChange.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  componentWillReceiveProps(newProps) {
    this.setState({ charm: newProps.charm })
  }

  handleChange(e) {
    let { name, value } = e.target

    this.setState({ charm: { ...this.state.charm, [name]: value }})
  }

  handleBlur(e) {
    const { name } = e.target
    const { charm } = this.state

    if (charm[name] != this.props.charm[name]) {
      this.props.onUpdate(charm.id, charm.character_id, name, charm[name])
    }
  }

  handleRatingChange(e) {
    let { name, value } = e.target
    const { charm } = this.state

    this.setState({ charm: { ...charm, [name]: value }})
    this.props.onUpdate(charm.id, charm.character_id, name, value)
  }

  handleTimingChange(e, key, value) {
    const { charm } = this.state

    this.setState({ charm: { ...charm, timing: value }})
    this.props.onUpdate(charm.id, charm.character_id, 'timing', value)
  }

  handleRemove() {
    this.props.onRemove(this.state.charm.id)
  }

  render() {
    const { character } = this.props
    const { charm } = this.state
    const { handleChange, handleBlur, handleRatingChange, handleRemove } = this

    const showAbility = charm.type == 'SolarCharm'
    const showMinAbility = isAbilityCharm(charm)

    return <BlockPaper>
      <Button onClick={ handleRemove } style={{ float: 'right' }}>
        Remove
        <ContentRemoveCircle />
      </Button>

      <TextField name="name" value={ charm.name }
        onChange={ handleChange } onBlur={ handleBlur }
        label="Name" margin="dense"
      />
      { charm.type == 'Evocation' &&
        <TextField name="artifact_name" value={ charm.artifact_name }
          onChange={ handleChange } onBlur={ handleBlur }
          label="Artifact Name" margin="dense"
        />
      }
      { charm.type == 'MartialArtsCharm' &&
        <TextField name="style" value={ charm.style }
          onChange={ handleChange } onBlur={ handleBlur }
          label="Style" margin="dense"
        />
      }
      <br />

      { showAbility &&
        <AbilitySelect name="ability" label="Ability" margin="dense"
          abilities={ abilitiesWithRatings(character) }
          value={ charm.ability }
          onChange={ handleRatingChange }
          multiple={ false }
        />
      }
      { showMinAbility &&
        <RatingField trait="min_ability" value={ charm.min_ability }
          min={ 1 } max={ ABILITY_MAX }
          onChange={ handleRatingChange }
          label="Ability" margin="dense"
        />
      }
      <RatingField trait="min_essence" value={ charm.min_essence }
        min={ ESSENCE_MIN } max={ ESSENCE_MAX }
        onChange={ handleRatingChange }
        label="Essence" margin="dense"
      />
      <br />

      <TextField select name="timing"
        label="Type" margin="dense"
        value={ charm.timing }
        onChange={ handleRatingChange }
      >
        <MenuItem value="reflexive">Reflexive</MenuItem>
        <MenuItem value="supplemental">Supplemental</MenuItem>
        <MenuItem value="simple">Simple</MenuItem>
        <MenuItem value="permanent">Permanent</MenuItem>
      </TextField>

      <TextField name="duration" value={ charm.duration }
        onChange={ handleChange } onBlur={ handleBlur }
        label="Duration" margin="dense"
      />
      <br />

      <TextField name="keywords" value={ charm.keywords }
        onChange={ handleChange } onBlur={ handleBlur }
        fullWidth={ true }
        label="Keywords" margin="dense"
      />
      <br />

      <TextField name="prereqs" value={ charm.prereqs }
        onChange={ handleChange } onBlur={ handleBlur }
        fullWidth={ true }
        label="Prerequisite Charms" margin="dense"
      />
      <br />

      <TextField name="body" value={ charm.body }
        onChange={ handleChange } onBlur={ handleBlur }
        className="editor-description-field" multiline fullWidth
        label="Effect" margin="dense"
      />
      <br />

      <TextField name="ref" value={ charm.ref }
        onChange={ handleChange } onBlur={ handleBlur }
        fullWidth={ true }
        label="Ref" margin="dense"
      />
    </BlockPaper>
  }
}
SingleCharmEditor.propTypes = {
  charm: PropTypes.object.isRequired,
  character: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
}

class CharmEditor extends React.Component {
  constructor(props) {
    super(props)

    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleAddNative = this.handleAddNative.bind(this)
    this.handleAddMA = this.handleAddMA.bind(this)
    this.handleAddEvocation = this.handleAddEvocation.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
  }

  handleUpdate(id, charId, trait, value) {
    this.props._handleUpdate(id, charId, trait, value)
  }

  handleAddNative() {
    let type
    switch(this.props.character.type) {
    case 'SolarCharacter':
      type = 'SolarCharm'
      break
    default:
      type = ''
    }
    this.props._handleCreate(this.props.character.id, type)
  }

  handleAddMA() {
    this.props._handleCreate(this.props.character.id, 'MartialArtsCharm')
  }

  handleAddEvocation() {
    this.props._handleCreate(this.props.character.id, 'Evocation')
  }

  handleRemove(id) {
    this.props._handleDestroy(id, this.props.character.id)
  }

  render() {
    /* Escape hatch */
    if (this.props.character == undefined)
      return <div>
        <Typography paragraph>This Character has not yet loaded.</Typography>
      </div>

    const { character, nativeCharms, martialArtsCharms, evocations } = this.props
    const {
      handleUpdate, handleRemove,
      handleAddNative, handleAddMA, handleAddEvocation,
    } = this

    let natives = []
    let maCharms = []
    let evo = []
    natives = nativeCharms.map((c) =>
      <Grid item xs={ 12 } md={ 6 } key={ c.id }>
        <SingleCharmEditor charm={ c } character={ character }
          onUpdate={ handleUpdate } onRemove={ handleRemove }
        />
      </Grid>
    )
    maCharms = martialArtsCharms.map((c) =>
      <Grid item xs={ 12 } md={ 6 } key={ c.id }>
        <SingleCharmEditor charm={ c } character={ character }
          onUpdate={ handleUpdate } onRemove={ handleRemove }
        />
      </Grid>
    )
    evo = evocations.map((c) =>
      <Grid item xs={ 12 } md={ 6 } key={ c.id }>
        <SingleCharmEditor charm={ c } character={ character }
          onUpdate={ handleUpdate } onRemove={ handleRemove }
        />
      </Grid>
    )

    return <div>
      <Grid container spacing={ 24 }>
        <Grid item xs={ 10 }>
          <Typography variant="headline">Charms</Typography>
        </Grid>
        <Grid item xs={ 2 }>
          <Button onClick={ handleAddNative }>
            <ContentAddCircle /> Add Native Charm
          </Button>
        </Grid>
        { natives }

        <Grid item xs={ 10 }>
          <Typography variant="headline">Martial Arts</Typography>
        </Grid>
        <Grid item xs={ 2 }>
          <Button onClick={ handleAddMA }>
            <ContentAddCircle /> Add MA Charm
          </Button>
        </Grid>
        { maCharms }

        <Grid item xs={ 10 }>
          <Typography variant="headline">Evocations</Typography>
        </Grid>
        <Grid item xs={ 2 }>
          <Button onClick={ handleAddEvocation }>
            <ContentAddCircle /> Add Evocation
          </Button>
        </Grid>
        { evo }
      </Grid>
    </div>
  }
}
CharmEditor.propTypes = {
  character: PropTypes.object,
  nativeCharms: PropTypes.arrayOf(PropTypes.object),
  martialArtsCharms: PropTypes.arrayOf(PropTypes.object),
  evocations: PropTypes.arrayOf(PropTypes.object),
  _handleCreate: PropTypes.func,
  _handleUpdate: PropTypes.func,
  _handleDestroy: PropTypes.func,
}

function mapStateToProps(state, ownProps) {
  const character = state.entities.characters[ownProps.match.params.characterId] || {}

  let nativeCharms = []
  let martialArtsCharms = []
  let evocations = []
  let artifacts = []

  switch (character.type) {
  case 'SolarCharacter':
    nativeCharms = character.solar_charms.map((id) => state.entities.charms[id])
  }

  if (character.evocations != undefined) {
    evocations = character.evocations.map((id) => state.entities.charms[id])
  }
  if (character.martial_arts_charms != undefined) {
    martialArtsCharms = character.martial_arts_charms.map((id) => state.entities.charms[id])
  }
  if (character.weapons != undefined) {
    artifacts = character.weapons.map((id) => state.entities.weapons[id]).filter((w) => w.is_artifact )
  }

  return {
    character,
    nativeCharms,
    martialArtsCharms,
    evocations,
    artifacts,
  }
}
function mapDispatchToProps(dispatch) {
  return {
    _handleUpdate: (id, charId, trait, value) => {
      dispatch(updateCharm(id, charId, trait, value))
    },
    _handleDestroy: (id, charId) => {
      dispatch(destroyCharm(id, charId))
    },
    _handleCreate: (charId, type) => {
      dispatch(createCharm(charId, type))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharmEditor)
