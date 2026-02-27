import { useCallback } from 'react';

const useFormSubmitHandler = (form) =>
  useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      void form.handleSubmit();
    },
    [form],
  );

export default useFormSubmitHandler;
