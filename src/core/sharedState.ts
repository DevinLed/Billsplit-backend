let postTransactionExecuted = false;

export function setPostTransactionExecuted() {
  postTransactionExecuted = true;
}

export function getPostTransactionExecuted() {
  return postTransactionExecuted;
}