// Generates a random RFC4122 UUID
export default function idempotencyKeyGen(): string {

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {

    const randomNum = Math.random() * 16 | 0;
    const uuid = c === 'x' ? randomNum : (randomNum & 0x3 | 0x8);
    return uuid.toString(16);
  });

}