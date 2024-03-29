import { createListenerMiddleware } from "@reduxjs/toolkit";
import { selectNodeUuid, setCurrentObjectId } from "./nodeReader";
import { RootState } from "@src/store";
import { fetchTreeThunk, reset } from "../drive/driveSlice";

export const nodeReaderMiddleware = createListenerMiddleware();

nodeReaderMiddleware.startListening({
  actionCreator: setCurrentObjectId,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const prevState = listenerApi.getOriginalState() as RootState;

    const prevNodeUuid = selectNodeUuid(prevState);
    const newNodeUuid = selectNodeUuid(state);

    //First run
    if (state.drive.status === "idle" && !state.drive.nodeTree) {
      listenerApi.dispatch(fetchTreeThunk());
    }

    //Everytime a node is switched
    // if (prevNodeUuid !== "") {
    if (prevNodeUuid !== newNodeUuid || !state.drive.nodeTree) {
      await listenerApi.delay(500); //Appears neccessary so the manifest can update before the tree is fetched
      listenerApi.dispatch(reset());
      listenerApi.dispatch(fetchTreeThunk());
    }
    // }
  },
});
