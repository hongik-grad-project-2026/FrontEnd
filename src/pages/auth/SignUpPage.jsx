import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBar from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";
import Select from "../../components/common/Select";
import { InputLayout } from "../../components/layout/AuthLayout"
import { signup } from "../../api/authApi";
import styles from "./SignUpPage.module.css"

const ID_PATTERN = /^[A-Z][0-9]{6}$/;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_PATTERN = /^010[0-9]{8}$/;

// 단과대학 목록
const COLLEGE_OPTIONS = [
    { value: "engineering", label: "공과대학" },
    { value: "design", label: "미술대학" },
    { value: "business", label: "경영대학" },
];

// 단과대학별 학과 목록 — key는 위 COLLEGE_OPTIONS의 value와 일치시킴
const DEPARTMENT_OPTIONS = {
    engineering: [
        { value: "computer", label: "컴퓨터공학과" },
        { value: "electronic", label: "전자전기공학부" },
        { value: "mechanical", label: "기계시스템디자인공학과" },
    ],
    design: [
        { value: "visual", label: "시각디자인전공" },
        { value: "industrial", label: "산업디자인전공" },
    ],
    business: [
        { value: "management", label: "경영학부" },
    ],
};


function SelectSection({ title, placeholder, id, options, value, onChange, disabled }) {
    return (
        <InputLayout
            id={id}
            title={title}
            children={
                <Select
                    id={id}
                    ariaLabel={title}
                    options={options}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    width={'100%'}
                />
            }
        />
    )
}

function InputTextSection({ title, placeholder, helperText, inputName, type = 'text', id, value, onChange }) {
    return (
        <InputLayout
            id={id}
            title={title}
            children={
                <InputBar placeholder={placeholder} helperText={helperText} width={'100%'}
                    name={inputName} type={type} id={id} value={value} onChange={onChange} />
            }
        />
    )
}


function SignUpPage() {

    const navigate = useNavigate();
    const [lastStep, setLastStep] = useState(false);
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [college, setCollege] = useState("");
    const [department, setDepartment] = useState("");
    const [termsAgree, setTermsAgree] = useState(false);

    const departmentOptions = DEPARTMENT_OPTIONS[college] ?? [];//// 선택된 단과대학에 딸린 학과 목록. 미선택이면 빈 배열



    function handleCollegeChange(nextCollege) {
        // 단과대학을 바꾸면 학과 선택은 초기화
        setCollege(nextCollege);
        setDepartment("");
    }


    // 제출 중 여부
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 서버가 돌려준 에러 문구 
    const [errorMessage, setErrorMessage] = useState("");

    // ----- 유효성 검사 -----
    const isNameValid = name.trim() !== "";
    const isIdValid = ID_PATTERN.test(id.trim());
    const isPasswordValid =
        password.length >= PASSWORD_MIN_LENGTH &&
        password.length <= PASSWORD_MAX_LENGTH;
    const isPasswordMatched = password === passwordConfirm;
    const isCollegeValid = college !== "";
    const isDepartmentValid = department !== "";
    const isEmailValid = EMAIL_PATTERN.test(email.trim());
    const isTelValid = TEL_PATTERN.test(tel.trim());



    // 안내 문구는 "입력이 시작된 뒤"에만 띄움
    const idHelperText =
        id !== "" && !isIdValid
            ? "학번 형식이 올바르지 않습니다. (예: C123456)"
            : "";

    const passwordHelperText =
        password !== "" && !isPasswordValid
            ? `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자리로 입력해 주세요.`
            : "";

    const passwordConfirmHelperText =
        passwordConfirm !== "" && !isPasswordMatched
            ? "비밀번호가 일치하지 않습니다."
            : "";

    const emailHelperText =
        email !== "" && !isEmailValid
            ? "이메일 형식이 올바르지 않습니다. (예: hongik@g.hongik.ac.kr)"
            : "";

    const telHelperText =
        tel !== "" && !isTelValid
            ? "전화번호는 '-' 없이 숫자 11자리로 입력해 주세요."
            : "";



    // 1단계 항목만 검사
    const canGoNext =
        isNameValid &&
        isIdValid &&
        isPasswordValid &&
        isPasswordMatched;

    // 2단계까지 모두 통과 -> 제출 가능
    const canSubmit =
        canGoNext &&
        isCollegeValid &&
        isDepartmentValid &&
        termsAgree &&
        !isSubmitting;


    async function handleSubmit(event) {
        event.preventDefault(); // 폼 기본 동작(페이지 새로고침) 차단

        // 버튼이 비활성이어도 Enter 키로 제출될 수 있어 한 번 더 막음
        if (!canSubmit) {
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await signup({
                name: name.trim(),
                id: id.trim(),
                password,
                email: email.trim(),
                tel: tel.trim(),
                college,
                department,
            });

            // 가입 완료 페이지로 이동
            // replace: 뒤로가기로 가입 폼에 돌아오지 못하도록
            // state: 가입을 거쳐서 왔다는 표시 (완료 페이지에서 확인용으로 쓸 수 있음)
            navigate("/signup/complete", {
                replace: true,
                state: {
                    name: name.trim(),
                    id: id.trim(),
                    email: email.trim(),
                    college,
                    department,
                },
            });
        } catch (error) {
            // signup에서 throw한 에러 문구를 그대로 화면에 표시
            setErrorMessage(error.message);
        } finally {
            // 성공하든 실패하든 제출 상태는 반드시 해제
            setIsSubmitting(false);
        }
    }
    function handleNextStep(event) {
        event.preventDefault();

        setLastStep(true);
    }

    return (
        <form
            className={styles.signupPage}
            // onSubmit={lastStep === false ? handleNextStep : handleSubmit}
            onSubmit={handleSubmit}
        >
            {lastStep === false ? (<div className={styles.innerPage}>
                <InputTextSection
                    title='이름' placeholder='이름을 입력하세요.'
                    inputName='name' id='name'
                    value={name} onChange={(event) => setName(event.target.value)}
                />
                <InputTextSection
                    title='학번' placeholder='학번을 입력하세요 (학번은 대문자로 시작합니다)'
                    helperText={idHelperText}
                    inputName='id' id='id'
                    value={id} onChange={(event) => setId(event.target.value)}
                />
                <InputTextSection
                    title='비밀번호' placeholder='비밀번호를 입력하세요 (8~16자리)'
                    inputName='password' type='password' id='password'
                    helperText={passwordHelperText}
                    value={password} onChange={(event) => setPassword(event.target.value)}
                />
                <InputTextSection
                    title='비밀번호 확인' placeholder='비밀번호를 다시 입력하세요'
                    inputName='passwordConfirm' type='password' id='passwordConfirm'
                    helperText={passwordConfirmHelperText}
                    value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)}
                />

                <div className={styles.buttonCon}>
                    <Button
                        className={styles.canGoButton}
                        color="Primary"
                        kind="fill"
                        size="Default"
                        status="Default"
                        text="다음 단계"
                        disabled={!canGoNext}
                        onClick={handleNextStep}
                    />
                </div>
            </div>) : (
                <div className={styles.innerPage}>
                    <InputTextSection
                        title='이메일' placeholder='이메일을 입력하세요.'
                        inputName='email' id='email'
                        helperText={emailHelperText}
                        value={email} onChange={(event) => setEmail(event.target.value)}
                    />
                    <InputTextSection
                        title='전화번호' placeholder='전화번호를 입력하세요 (‘-’ 제외하고 숫자만 입력)'
                        helperText={telHelperText}
                        inputName='tel' id='tel'
                        value={tel} onChange={(event) => setTel(event.target.value)}
                    />

                    <SelectSection
                        title="단과대학"
                        placeholder="단과대학을 선택하세요"
                        id="college"
                        options={COLLEGE_OPTIONS}
                        value={college}
                        onChange={handleCollegeChange}
                    />

                    <SelectSection
                        title="학과"
                        placeholder="학과를 선택하세요"
                        id="department"
                        options={departmentOptions}
                        value={department}
                        onChange={(nextDepartment) => setDepartment(nextDepartment)}
                        disabled={college === ""}
                    />


                    <div className={styles.termsAgreement}>
                        <label className={styles.checkBoxLabel}>
                            <Checkbox
                                className={styles.checkBox}
                                ariaLabel="약관 동의"
                                checked={termsAgree}
                                onChange={(event) => setTermsAgree(event.target.checked)}
                            />
                            <span className={styles.labelText}>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                        </label>
                        <div className={styles.termsText}>
                            기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용. 기자재 대여 신청 및 관리를 위한 개인정보 수집·이용 자세한 내용.
                        </div>
                    </div>



                    <div className={styles.buttonCon}>
                        <Button
                            className={styles.backButton}
                            color="Neutral"
                            kind="border"
                            size="Default"
                            status="Default"
                            text="이전 단계"
                            disabled={false}
                            onClick={() => { setLastStep(false); }}
                        />
                        <Button
                            className={styles.submitButton}
                            color="Primary"
                            kind="fill"
                            size="Default"
                            status="Default"
                            type="submit"
                            text="회원가입"
                            disabled={!canSubmit}
                        />
                    </div>
                </div>)}

            <p className={styles.returnToLogin} onClick={() => navigate('/')}>로그인 화면으로 돌아가기</p>
        </form>
    );
}

export default SignUpPage;