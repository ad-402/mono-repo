"use client";

import { useState, useRef, useEffect } from "react";
import { useGreeting } from "../hooks/useGreeting";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";

const Greeting = () => {
  const [newGreeting, setNewGreeting] = useState<string>("");
  const newGreetingInputRef = useRef<HTMLInputElement>(null);

  const onSetGreetingSuccess = () => {
    toast.success(`Successfully set your new greeting`, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      theme: "light",
      className: "text-sm",
    });
    setNewGreeting("");
    newGreetingInputRef.current?.blur();
  };

  const {
    address,
    greeting,
    getGreetingLoading,
    getGreetingError,
    setGreeting,
    setGreetingLoading,
    prepareSetGreetingError,
    setGreetingError,
  } = useGreeting({ newGreeting, onSetGreetingSuccess });

  useEffect(() => {
    if (!address) {
      setNewGreeting("");
    }
  }, [address]);

  const { openConnectModal } = useConnectModal();

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Greeting from the blockchain:
        </p>
        {getGreetingLoading ? (
          <p className="text-lg text-center text-muted-foreground italic">Loading...</p>
        ) : (
          <p
            className={
              !getGreetingError
                ? `text-lg text-center`
                : `text-lg text-center text-destructive`
            }
          >
            {!getGreetingError
              ? greeting
              : `There was an error getting the greeting`}
          </p>
        )}
      </div>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <input
            className="border p-4 text-center"
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder="Write a new greeting"
            ref={newGreetingInputRef}
            disabled={!address}
            value={newGreeting}
          />
          <button
            className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground py-4 px-8"
            onClick={setGreeting}
            disabled={
              !address ||
              !newGreeting ||
              setGreetingLoading ||
              !!prepareSetGreetingError
            }
          >
            {!setGreetingLoading
              ? `Set your new greeting on the blockchain`
              : `Setting greeting...`}
          </button>
          {!address && (
            <button
              className="text-sm text-muted-foreground text-center underline hover:opacity-80"
              onClick={openConnectModal}
            >
              Connect your wallet to set a new greeting
            </button>
          )}
          {address && !newGreeting && (
            <p className="text-sm text-muted-foreground text-center">
              Type something to set a new greeting
            </p>
          )}
          {setGreetingError && (
            <p className="text-sm text-destructive text-center">
              There was an error setting your new greeting
            </p>
          )}
          {newGreeting && prepareSetGreetingError && (
            <p className="text-sm text-destructive text-center">
              Sorry, only the contract owner can set a greeting
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { Greeting };
