
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

export function randomString(length) {
  if (!length || length <= 0)
    return "";

  // generates onyl lowercase letters
  // let source = "";
  // if (source.length < length)
  //   source += Math.random().toString(36).substring(2);
  //
  // const random = source.substring(0, length);
  // return random;

  const possibleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const possibleAll = `${possibleLetters}0123456789`;

  const buffer = [];

  // start with letter
  buffer.push(possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length)));

  for (let i = 1; i < length; i += 1) {
    buffer.push(possibleAll.charAt(Math.floor(Math.random() * possibleAll.length)));
  }

  return buffer.join('');
}

// ----------------------------------------------------------------------------------
