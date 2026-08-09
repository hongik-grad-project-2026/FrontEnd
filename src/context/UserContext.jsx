import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext(null); //null:비로그인


export function UserProvider({ children }) {

    const [user, setUser] = useState({
        id: null,
        name: null,
        role: null, // 'admin' | 'student' 등
    });


    useEffect(() => {
        // 임시 더미
        const getUserInfo = {
            id: 'C123456',
            name: '홍길동',
            role: 'admin'
        };

        setUser(getUserInfo);
    }, []);

    useEffect(() => {

        console.log(user)
    }, [user])

    // Provider가 하위 컴포넌트에 전달할 값
    const value = { user, setUser };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};


export function useUser() {
    console.log("====useUser===");
    return useContext(UserContext);
}