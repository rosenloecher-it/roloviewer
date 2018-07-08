
// ----------------------------------------------------------------------------------

export function shortenString(inputText, maxLength) {
  if (!inputText)
    return inputText;

  const length = inputText.length;
  if (length < 3 || maxLength < 3)
    return "";
  if (length <= maxLength)
    return inputText;

  return (inputText.substring(0, maxLength - 3) + '...');
}

// ----------------------------------------------------------------------------------
