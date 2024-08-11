import { Box } from '@mui/material';
import { useState } from 'react';
import RootNoteSelect, { RootOption } from './SelectRootNote';
import TuningSelector, { TuningOption } from './TuningSelector';
import ModeSelector from './ModeSelector';
import KeyAndTuningButton from './KeyAndTuningButton';
import CompensateForTuningOption from './CompensateForTuningOption';
import Reset from './ResetButton'
import ChordNumeralButtons from './ChordNumeralButtons';
import AddChordButtton from './AddChordButton'
import { ModeOption } from './ModeSelector';
import { ChordNumber } from './ChordNumeralButtons';
import ChordProgressionTable from './ChordProgressionTable';
import axios from 'axios';
import { BlobOptions } from 'buffer';

const SelectionContainer = () => {
  const [selectedRoot, setSelectedRoot] = useState<RootOption | null>(null);
  const [selectedMode, setSelectedMode] = useState<ModeOption | null>(null);
  const [selectedTuning, setSelectedTuning] = useState<TuningOption | null>(null);
  const [stringTunings, setStringTunings] = useState<string[]>(Array(6).fill(""));
  const [compensateOption, setCompensate] = useState<boolean>(false); //intentionally won't be reset by "Reset" component
  const [chordNum, setChordNum] = useState<ChordNumber | null>(null);
  const [isSubmitEnabled, setSubmitEnabled] = useState<boolean>(false);
  const [hasChordNum, setHasChordNum] = useState<boolean>(false);
  const [modeInstanceState, setModeInstanceState] = useState<{ root: string; chromatic: string[]; scale: string[]; } | null>(null);
  const [chordsArray, setChordsArray] = useState<{numeral: string, chord_name: string, chord_tabs: string[], chord_notes: string}[]>([]);
  const [isAddChordDisabled, setAddChordDisabled] = useState<boolean>(true);
  const [selectRootDisabled, setSelectedRootDisabled] = useState<boolean>(false);
  const [selectModeDisabled, setSelectModeDisabled] = useState<boolean>(false);
  const [selectTuningDisabled, setSelectedTuningDisabled] = useState<boolean>(false);
  const [compensateOptionDisabled, setCompensateOptionDisabled] = useState<boolean>(false);
  
  const handleRootSelect = (root: RootOption | null) => {
    setSelectedRoot(root);
  };

  const resetInputs = () => {
    setSelectedRoot(null);
    setSelectedTuning(null);
    setSelectedMode(null);
    setStringTunings(Array(6).fill(""));
    setSubmitEnabled(false);
    setHasChordNum(false);
    setChordNum(null);
    setModeInstanceState(null);
    setChordsArray([]);
    setAddChordDisabled(true);
    setSelectedRootDisabled(false);
    setSelectModeDisabled(false);
    setSelectedTuningDisabled(false);
    setCompensateOptionDisabled(false);
  };

  const handleModeSelect = (mode: ModeOption | null) => {
    setSelectedMode(mode);
  };

  const handleCompensateSelect = (selection: boolean) => {
    setCompensate(selection);
  };

  const handleKeyTuningSubmit = (modeInstance: { root: string; chromatic: string[]; scale: string[]; }) => {
    setAddChordDisabled(false);
    setModeInstanceState(modeInstance);
    setSelectedRootDisabled(true);
    setSelectModeDisabled(true);
    setSelectedTuningDisabled(true);
    setCompensateOptionDisabled(true);
  };

  const handleNumeralSelect = (num: ChordNumber) => {
    setHasChordNum(true);
    setChordNum(num);
  };

  const addChord = async (num:ChordNumber | null) => {
    try {
      if (modeInstanceState && num && selectedTuning != null) {
        const responseChord = await axios.post('http://localhost:3000/api/add/chord', {
          numeral: num.value,
          mode: modeInstanceState,
          compensate: compensateOption,
          tuning: stringTunings,
          chordsArray: chordsArray
        });
        setChordsArray(responseChord.data);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const isIncomplete =
    !selectedRoot ||
    !selectedMode ||
    !selectedTuning ||
    (selectedTuning.tuning === 'Other' && stringTunings.some((tuning) => !tuning));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <RootNoteSelect 
        rootState={selectedRoot}
        onSelect={handleRootSelect}
        isDisabled={selectRootDisabled} />
      <ModeSelector 
        modeState={selectedMode}
        onSelect={handleModeSelect}
        isDisabled={selectModeDisabled} />
      <TuningSelector 
        tuningState={selectedTuning}
        stringTuningState={stringTunings}
        setTuning={setSelectedTuning}
        setStringTuning={setStringTunings}
        isDisabled={selectTuningDisabled} />
      <CompensateForTuningOption 
        onSelect={handleCompensateSelect}
        isDisabled={compensateOptionDisabled} />
      <KeyAndTuningButton
        submitEnabled={isSubmitEnabled}
        setEnableSubmit={setSubmitEnabled}
        isIncomplete={isIncomplete}
        selectedRoot={selectedRoot}
        selectedMode={selectedMode}
        selectedTuning={selectedTuning?.tuning ?? null}
        tuningCompensation={compensateOption}
        onSubmit={handleKeyTuningSubmit}
      />
      <ChordNumeralButtons 
        onSelect={handleNumeralSelect}/>
      <AddChordButtton 
        isDisabled={isAddChordDisabled}
        hasChordNum={hasChordNum}
        chordNum={chordNum}
        onSubmit={addChord}/>
      <Reset
        onClick={resetInputs}
      />
      <ChordProgressionTable
        ChordsArr={chordsArray}
      />
    </Box>
  )
}

export default SelectionContainer;