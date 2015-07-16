import { SimpleNode } from 'dslink';

export function promiseify(cb) {
  const promise = new Promise((resolve, reject) => {
    cb((data) => {
      if(data instanceof Error || data.Error)
        reject(data);
      resolve(data);
    });
  });
}
