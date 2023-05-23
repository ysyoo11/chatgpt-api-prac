import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Modal, type ModalProps } from '@/components/ui/Modal';
import {
  Notification,
  type NotificationProps,
} from '@/components/ui/Notification';
import { useTimer } from '@/hooks/use-timer';

type NotificationContent = Pick<
  NotificationProps,
  'variant' | 'title' | 'content' | 'className'
>;
type ModalContent = Pick<
  ModalProps,
  'variant' | 'title' | 'content' | 'actionButton' | 'cancelButton'
>;

export type AssertiveState = {
  notiFlag: boolean;
  notiContent: NotificationContent;
  modalFlag: boolean;
  modalContent: ModalContent;
};

type AssertiveStore = AssertiveState & {
  resetStore: () => void;
  closeNoti: () => void;
  showNoti: (notiContent: NotificationContent, autoCloseMS?: number) => void;
  showAlert: (
    error: { name: string; message: string },
    autoCloseMS?: number
  ) => void;
  showModal: (modalContent: ModalContent) => void;
  closeModal: () => void;
};

const initialState: AssertiveState = {
  notiFlag: false,
  notiContent: { variant: 'default', title: '' },
  modalFlag: false,
  modalContent: {
    variant: 'default',
    title: '',
    content: '',
    actionButton: { label: '', onClick: () => {} },
    cancelButton: { label: '', onClick: () => {} },
  },
};
const initialNotiContent: NotificationContent = {
  variant: 'default',
  title: '',
};
const initialModalContent: ModalContent = {
  variant: 'default',
  title: '',
  content: '',
  actionButton: { label: '', onClick: () => {} },
  cancelButton: { label: '', onClick: () => {} },
};
const initialModal: Pick<AssertiveState, 'modalFlag' | 'modalContent'> = {
  modalFlag: false,
  modalContent: initialModalContent,
};
export const AssertiveContext = createContext<AssertiveState>(initialState);

export function AssertiveStoreProvider({ children }: { children: ReactNode }) {
  // Save modal data to prevent closing with notification
  const modalRef =
    useRef<Pick<AssertiveState, 'modalFlag' | 'modalContent'>>(initialModal);
  const [store, setStore] = useState<AssertiveState>(initialState);

  const resetStore = useCallback(() => setStore(initialState), []);

  const { clearTimer, resetTimer } = useTimer();

  const closeNoti = useCallback(() => {
    clearTimer();
    setStore((prev) => ({ ...prev, ...modalRef.current, notiFlag: false }));
    setTimeout(() => {
      setStore((prev) => ({ ...prev, notiContent: initialNotiContent }));
    }, 300);
  }, [clearTimer]);

  const showNoti = useCallback(
    (notiContent: NotificationContent, autoCloseMS = 3000) => {
      resetTimer(autoCloseMS, closeNoti);
      setStore({ ...store, notiContent, notiFlag: true });
    },
    [resetTimer, store, closeNoti]
  );

  const showAlert = useCallback(
    (error: { name: string; message: string }, autoCloseMS = 3000) => {
      const { name, message } = error;

      resetTimer(autoCloseMS, closeNoti);
      setStore({
        ...store,
        notiFlag: true,
        notiContent: { variant: 'alert', title: `[${name}] - ${message}` },
      });
    },
    [resetTimer, store, closeNoti]
  );

  const showModal = useCallback(
    (modalContent: ModalContent) => {
      modalRef.current = { modalContent, modalFlag: true };
      setStore({ ...store, modalContent, modalFlag: true });
    },
    [store]
  );

  const closeModal = useCallback(() => {
    modalRef.current = initialModal;
    setStore({ ...store, modalFlag: false });
    setTimeout(() => {
      setStore((prev) => ({ ...prev, modalContent: initialModalContent }));
    }, 300);
  }, [store]);

  const value = useMemo<AssertiveStore>(
    () => ({
      ...store,
      resetStore,
      closeNoti,
      showNoti,
      showAlert,
      showModal,
      closeModal,
    }),
    [store, resetStore, closeNoti, showNoti, showAlert, showModal, closeModal]
  );

  return (
    <AssertiveContext.Provider value={value}>
      {children}
      <Notification
        className='z-20'
        show={store.notiFlag}
        close={closeNoti}
        {...store.notiContent}
      />
      <Modal
        show={store.modalFlag}
        close={closeModal}
        {...store.modalContent}
      />
    </AssertiveContext.Provider>
  );
}

export const useAssertiveStore = () => {
  const context = useContext(AssertiveContext);

  if (context === undefined) {
    throw new Error(
      `useAssertiveStore must be used within a AssertiveStoreProvider`
    );
  }

  return context as AssertiveStore;
};
