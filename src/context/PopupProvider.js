import React, { createContext, useContext } from "react";
import { useErrorPopup } from "../components/popup/errorPopup";
import { useSuccessPopup } from "../components/popup/successPopup";
import { useConfirmationPopup } from "../components/popup/confirmationPopup";
const ErrorPopupContext = createContext();

export const ErrorPopupProvider = ({ children }) => {
  const { showErrorPopup, ErrorPopup } = useErrorPopup();
  const { showSuccessPopup, SuccessPopup } = useSuccessPopup();
  const { showConfirmationPopup,ConfirmationPopup, } = useConfirmationPopup()

  return (
    <ErrorPopupContext.Provider value={{ showErrorPopup, showSuccessPopup, showConfirmationPopup }}>
      {children}
      <ErrorPopup />
      <SuccessPopup />
      {/* <ConfirmationPopup /> */}
    </ErrorPopupContext.Provider>
  );
};

export const useErrorPopupContext = () => useContext(ErrorPopupContext);
