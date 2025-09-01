import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logout } from "@/auth/auth";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";

import { MdLogout } from "react-icons/md";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

function ProfileDropdown() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        console.log(user);
        console.log(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const firstName = user?.displayName?.split(" ")[0];

  //   const [loader, setLoader] = useState();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      return true; // success
    } catch (error) {
      if (error.code === "auth/no-current-user") {
        // already signed out → not really a failure
        return true;
      }
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left ">
      <div>
        <MenuButton className="rounded-full  focus:outline-none cursor-pointer  ">
          <img
            src={user?.photoURL}
            alt="User Avatar"
            className="w-9 h-9 rounded-full object-cover mt-1 active:outline-5"
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute pt-3 py-5 flex flex-col items-center  right-0 z-10 mt-2 w-90 origin-top-right rounded-3xl bg-[#E9EEF6] shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1 ">
          <MenuItem className="">
            <div className="flex justify-center text-[15px] text-black tracking-wide">
              {user.email}
            </div>
          </MenuItem>

          <MenuItem className=" py-5  ">
            <div className="flex flex-col gap-2 items-center justify-center">
              <img
                src={user?.photoURL}
                alt=""
                className="rounded-full h-20 w-20 object-cover"
              />
              <p className="text-gray-800 text-[19px] font-poppins font-light ">
                Hii, {firstName} !
              </p>
            </div>
          </MenuItem>

          <MenuItem className=" mb-5 ">
            <div className=" mx-5 flex items-center justify-center py-2 cursor-pointer bg-[#1B1B1B] hover:bg-[#1B1B1B]/80 rounded-4xl ">
              <MdLogout className="text-gray-300 text-2xl" />
              <button
                onClick={handleLogout}
                className=" block  px-4 py-2 text-left text-sm text-white cursor-pointer font-light"
              >
                Sign out
              </button>
            </div>
          </MenuItem>

          <MenuItem>
            <div className=" flex items-center justify-center py-2 cursor-pointer text-xs text-gray-700 gap-2 ">
              <p>Privacy Policy</p>
              <span>|</span>
              <p>Terms of Service</p>
            </div>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default ProfileDropdown;
