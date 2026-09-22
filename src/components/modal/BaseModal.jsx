import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./BaseModal.module.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled):not([type='hidden'])",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const modalStack = [];

let bodyScrollLockCount = 0;
let previousBodyOverflow = "";

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

function canReceiveFocus(element) {
  if (
    typeof window === "undefined" ||
    !(element instanceof window.HTMLElement) ||
    !element.isConnected
  ) {
    return false;
  }

  if (
    element.closest("[inert]") ||
    element.closest('[aria-hidden="true"]') ||
    element.getClientRects().length === 0
  ) {
    return false;
  }

  return true;
}

function focusElement(element) {
  if (!canReceiveFocus(element)) {
    return false;
  }

  element.focus({ preventScroll: true });

  return true;
}

function getFocusableElements(panelElement) {
  if (!panelElement) {
    return [];
  }

  return Array.from(panelElement.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0 && canReceiveFocus(element),
  );
}

function unregisterModal(modalToken) {
  const modalIndex = modalStack.findIndex(
    (modal) => modal.token === modalToken,
  );

  if (modalIndex >= 0) {
    modalStack.splice(modalIndex, 1);
  }
}

function registerModal(modalToken, panelElement) {
  unregisterModal(modalToken);

  modalStack.push({
    panelElement,
    token: modalToken,
  });
}

function getTopModal() {
  return modalStack[modalStack.length - 1];
}

function isTopModal(modalToken) {
  return getTopModal()?.token === modalToken;
}

function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);

  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;

    previousBodyOverflow = "";
  }
}

function BaseModal({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  children,
  className = "",
  closeOnEscape = true,
  closeOnOverlay = true,
  initialFocusRef,
  isOpen = false,
  onClose,
  returnFocusRef,
}) {
  const panelRef = useRef(null);
  const modalTokenRef = useRef(Symbol("base-modal"));
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);
  const restoreFocusFrameRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (
      !isOpen ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      return undefined;
    }

    const panelElement = panelRef.current;

    if (!panelElement) {
      return undefined;
    }

    const modalToken = modalTokenRef.current;
    const previouslyFocusedElement = document.activeElement;

    if (restoreFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(restoreFocusFrameRef.current);

      restoreFocusFrameRef.current = null;
    }

    registerModal(modalToken, panelElement);
    lockBodyScroll();

    const initialFocusFrameId = window.requestAnimationFrame(() => {
      if (!isTopModal(modalToken)) {
        return;
      }

      const currentPanelElement = panelRef.current;

      if (!currentPanelElement) {
        return;
      }

      const requestedInitialFocusElement = initialFocusRef?.current;

      if (
        requestedInitialFocusElement &&
        currentPanelElement.contains(requestedInitialFocusElement) &&
        focusElement(requestedInitialFocusElement)
      ) {
        return;
      }

      const [firstFocusableElement] = getFocusableElements(currentPanelElement);

      if (focusElement(firstFocusableElement)) {
        return;
      }

      focusElement(currentPanelElement);
    });

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || !isTopModal(modalToken)) {
        return;
      }

      if (event.key === "Escape") {
        if (!closeOnEscapeRef.current || !onCloseRef.current) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        onCloseRef.current("escape", event);

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentPanelElement = panelRef.current;

      if (!currentPanelElement) {
        return;
      }

      const focusableElements = getFocusableElements(currentPanelElement);

      if (focusableElements.length === 0) {
        event.preventDefault();
        focusElement(currentPanelElement);

        return;
      }

      const firstFocusableElement = focusableElements[0];

      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;
      const focusIsInsidePanel = currentPanelElement.contains(activeElement);

      if (
        event.shiftKey &&
        (!focusIsInsidePanel || activeElement === firstFocusableElement)
      ) {
        event.preventDefault();
        focusElement(lastFocusableElement);

        return;
      }

      if (
        !event.shiftKey &&
        (!focusIsInsidePanel || activeElement === lastFocusableElement)
      ) {
        event.preventDefault();
        focusElement(firstFocusableElement);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      const wasTopModal = isTopModal(modalToken);

      window.cancelAnimationFrame(initialFocusFrameId);

      document.removeEventListener("keydown", handleKeyDown);

      unregisterModal(modalToken);
      unlockBodyScroll();

      if (!wasTopModal) {
        return;
      }

      const returnFocusElement =
        returnFocusRef?.current ?? previouslyFocusedElement;

      restoreFocusFrameRef.current = window.requestAnimationFrame(() => {
        const topModal = getTopModal();

        if (topModal) {
          if (
            canReceiveFocus(returnFocusElement) &&
            topModal.panelElement.contains(returnFocusElement) &&
            focusElement(returnFocusElement)
          ) {
            restoreFocusFrameRef.current = null;
            return;
          }

          const [firstFocusableElement] = getFocusableElements(
            topModal.panelElement,
          );

          if (!focusElement(firstFocusableElement)) {
            focusElement(topModal.panelElement);
          }

          restoreFocusFrameRef.current = null;
          return;
        }

        focusElement(returnFocusElement);
        restoreFocusFrameRef.current = null;
      });
    };
  }, [initialFocusRef, isOpen, returnFocusRef]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleOverlayPointerDown = (event) => {
    if (
      !closeOnOverlay ||
      !onClose ||
      event.target !== event.currentTarget ||
      !isTopModal(modalTokenRef.current)
    ) {
      return;
    }

    event.preventDefault();

    onClose("overlay", event);
  };

  return createPortal(
    <div className={styles.overlay} onPointerDown={handleOverlayPointerDown}>
      <div
        ref={panelRef}
        className={joinClassNames(styles.panel, className)}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default BaseModal;
