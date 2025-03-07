import Controller from "../Controller";


export default interface Middleware extends Controller {
  controller: Controller; // Decorated controller
}
