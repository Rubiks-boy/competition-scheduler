import type { Reducer, State } from "../types";

export const appReducer: Reducer = (state, action) => {
  switch (action.type) {
    case "IMPORT_APP_STATE": {
      const { source, appState } = action;

      if (state.isDebugging) {
        console.log("Imported app state", source, appState);
      }

      const stateAfterImport: State = {
        isOnHomePage: false,
        importSource: source,

        // From AlwaysImportableAppState
        selectedCompId: appState.selectedCompId,
        isNumStationsTouched: state.isNumStationsTouched,
        numStations: appState.numStations,
        startTimes:
          appState.startTimes?.map((d) => new Date(d)) ?? state.startTimes,
        isShowingDefaultInfo: appState.isShowingDefaultInfo,
        hasReorderedEvents: appState.hasReorderedEvents,
        events: appState.events,
        schedule: appState.schedule,
        otherActivities: appState.otherActivities,
        venueName: appState.venueName,
        stages: appState.stages,

        // From ShareableState
        speedSlider: appState.speedSlider ?? 0,
        competitorLimit: appState.competitorLimit ?? state.competitorLimit,
        customStages: appState.customStages ?? state.customStages,
        isUsingCustomStages:
          appState.isUsingCustomStages ?? state.isUsingCustomStages,
        numberOfDays: appState.numberOfDays ?? state.numberOfDays,
        numOtherActivities:
          appState.numOtherActivities ?? state.numOtherActivities,

        // Remaining state
        accessToken: state.accessToken,
        manageableCompsPending: state.manageableCompsPending,
        manageableComps: state.manageableComps,
        wcifPending: state.wcifPending,
        wcif: state.wcif,
        activeStep: state.activeStep,
        isExported: false,
        isDebugging: state.isDebugging,
        experimentalFeaturesEnabled: state.experimentalFeaturesEnabled,
        showAdvanced: state.showAdvanced,
        isStationaryCompetition: state.isStationaryCompetition,
      };

      return stateAfterImport;
    }

    case "SET_ACTIVE_STEP":
      return {
        ...state,
        activeStep: action.activeStep,
      };

    case "EXPORTED":
      return {
        ...state,
        isExported: true,
      };

    case "SHOW_ADVANCED":
      return {
        ...state,
        showAdvanced: action.showAdvanced,
      };

    case "LEAVE_HOMEPAGE":
      return {
        ...state,
        isOnHomePage: false,
      };

    case "SET_SPEED":
      return {
        ...state,
        speedSlider: action.value,
      };

    default:
      return state;
  }
};
