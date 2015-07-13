export function sanitize(obj, ...props) {
  const returned = Object.assign({}, obj);
  props.forEach((prop) => {
    if(returned.hasOwnProperty(prop))
      delete returned[prop];
  });
  return returned;
}
