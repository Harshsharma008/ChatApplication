import { useEffect, useState,useRef } from "react";
import { Box, VStack, Container, Button, Input, HStack } from "@chakra-ui/react";
import Message from "./Components/Message";
import {onAuthStateChanged, getAuth,GoogleAuthProvider, signInWithPopup,signOut } from "firebase/auth";
import { app } from "./firebase"
import {getFirestore,addDoc, collection, serverTimestamp,onSnapshot,query,orderBy } from "firebase/firestore";


const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider);
}


const logoutHandler = () => signOut(auth)

function App() {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const divForScroll = useRef(null);

  const SubmitHandler = async(e) => {
    e.preventDefault();
  
    try {
      setMessage("");
    await addDoc(collection(db, "Messages"), {
      text: message,
      uid: user.uid,
      uri: user.photoURL,
      createdAt: serverTimestamp()
      
  
    });
    
    divForScroll.current.scrollIntoView({ behaviour:"smooth"})
  } catch (error) {
    alert(error);
  }
    
  }
  useEffect(() => {
    const q=query(collection(db,"Messages"),orderBy("createdAt","asc"))

    const unSubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });
    const unsubscribeForMessage = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((item) => {
        const id = item.id;
        return { id, ...item.data() };

      }));
    })
    return () => {
      unSubscribe();
      unsubscribeForMessage();
    };

  }, []);
  const security = 1234;
  return (
    <Box bg={"red.50"}>
      {
        user ? (<Container h={"100vh"} bg={"white"}>
          <HStack justifyContent={"center"}> <h1><b>बात चीत</b></h1></HStack>
        {/* flex direction of vstack is column and in center */}
          <VStack h={"full"} w={"auto"} >
            
          <Button onClick={logoutHandler} colorScheme={"red"} w={"full"}>Logout</Button>
            <VStack h={"full"} w={"full"} paddingX={"0"} paddingY={"4"} overflowY={"auto"} css={{
              "&::- webkit-scrollbar": {
                display: "none"
          }}}>
              {
                messages.map ((item) => (
                  <Message
                    key={item.id}
                    user={item.uid === user.uid ? "me" : "other"}
                    text={item.text}
                    uri={item.uri} />
                ))
          }
             <div ref={divForScroll}></div>
          </VStack>
           
            <form value={message} onChange={(e) =>setMessage(e.target.value)} onSubmit={SubmitHandler} style={{ width:"100%",background:"blue.50" }}>
            {/* HStack is the horizontal stack */}
            <HStack> 
            <Input placeholder="Enter a Message..." />
            <Button colorScheme={"purple"} type="submit">send</Button>
           </HStack>
          </form>
        
        </VStack>
        </Container>) : <VStack justifyContent={"center"} h={"100vh"}>
            <Button onClick={loginHandler} colorScheme="purple">Sign In With Google</Button>
</VStack>
      }
      

          </Box>
  );
}

export default App;