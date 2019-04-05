export const Avatars: {[key:string]: any} = {}

for( let i = 0; i<= 16; i ++ )
  Avatars[i+""] = require(`../assets/avatars/${i}.svg`)
  // console.log("filled avatars: ", Avatars);
  