export let isDummyStudentAccessGranted = false;

export function toggleAccess() {
  isDummyStudentAccessGranted = !isDummyStudentAccessGranted;
  return isDummyStudentAccessGranted;
}
