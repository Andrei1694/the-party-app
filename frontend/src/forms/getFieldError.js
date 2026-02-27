const getFieldError = (errors) => {
  if (!errors?.length) {
    return null;
  }

  const [firstError] = errors;

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (firstError && typeof firstError === 'object' && 'message' in firstError) {
    return String(firstError.message);
  }

  return 'Invalid value.';
};

export default getFieldError;
