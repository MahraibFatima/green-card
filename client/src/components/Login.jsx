import React from "react";
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  const onSubmitHandler = (e) => {
    e.preventDefault();
    setUser({
      email: "jam@mail.com",
      name: "Jam"
    })
    setShowUserLogin(false);
  }
  
  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center 
      text-sm text-gray-600 bg-black/50"
    >
      <form 
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-6 m-auto items-center p-8 py-12 w-96 sm:w-[400px] 
        min-h-[500px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium mb-2">
          <span className="text-primary">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>
        
        {state === "register" && (
          <div className="w-full">
            <p className="font-medium mb-1">Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Type your name"
              className="border border-gray-300 rounded w-full p-3 mt-1 outline-primary 
              focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              type="text"
              required
            />
          </div>
        )}
        
        <div className="w-full">
          <p className="font-medium mb-1">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Type your email"
            className="border border-gray-300 rounded w-full p-3 mt-1 outline-primary 
            focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            type="email"
            required
          />
        </div>
        
        <div className="w-full">
          <p className="font-medium mb-1">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Type your password"
            className="border border-gray-300 rounded w-full p-3 mt-1 outline-primary 
            focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            type="password"
            required
          />
        </div>
        
        <div className="mt-2 w-full text-center">
          {state === "register" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-primary cursor-pointer font-medium hover:underline"
              >
                Click here
              </span>
            </p>
          ) : (
            <p>
              Create an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-primary cursor-pointer font-medium hover:underline"
              >
                Click here
              </span>
            </p>
          )}
        </div>
        
        <button className="mt-4 bg-primary hover:bg-primary-dull transition-all 
        text-white w-full py-3 rounded-md cursor-pointer font-medium text-base
        hover:shadow-md active:scale-[0.98]">
          {state === "register" ? "Create Account" : "Login"}
        </button>

      </form>
    </div>
  );
};

export default Login;