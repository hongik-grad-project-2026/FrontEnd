import { useRef, useState } from "react";
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
    // 서울캠퍼스
    { value: "engineering", label: "공과대학" },
    { value: "architecture", label: "건축도시대학" },
    { value: "business", label: "경영대학" },
    { value: "liberalArts", label: "문과대학" },
    { value: "law", label: "법과대학" },
    { value: "education", label: "사범대학" },
    { value: "fineArts", label: "미술대학" },
    { value: "economics", label: "경제학부" },
    { value: "designArtManagement", label: "디자인·예술경영학부" },
    { value: "performingArts", label: "공연예술학부" },
    { value: "undeclaredSeoul", label: "캠퍼스자율전공(서울)" },
    { value: "convergenceSeoul", label: "융합전공(서울)" },
    { value: "bioHealth", label: "바이오헬스융합학부" },
    { value: "generalStudiesSeoul", label: "교양과(서울)" },
    // 세종캠퍼스
    { value: "scienceTech", label: "과학기술대학" },
    { value: "aidScienceTech", label: "AID융합과학기술대학" },
    { value: "game", label: "게임학부" },
    { value: "commerce", label: "상경대학" },
    { value: "formativeArts", label: "조형대학" },
    { value: "advertisingPR", label: "광고홍보학부" },
    { value: "industrialSports", label: "산업스포츠학과" },
    { value: "sportsCoaching", label: "스포츠지도학과" },
    { value: "undeclaredSejong", label: "캠퍼스자율전공(세종)" },
    { value: "convergenceSejong", label: "융합전공(세종)" },
    { value: "generalStudiesSejong", label: "교양과(세종)" },
];

// 단과대학별 학과 목록 — key는 위 COLLEGE_OPTIONS의 value와 일치시킴
const DEPARTMENT_OPTIONS = {
    // ─── 서울캠퍼스 ───
    engineering: [
        { value: "electronicElectrical", label: "전자전기공학부" },
        { value: "materials", label: "신소재공학전공" },
        { value: "chemicalEngineering", label: "화학공학전공" },
        { value: "computer", label: "컴퓨터공학과" },
        { value: "industrialData", label: "산업·데이터공학과" },
        { value: "mechanicalSystemDesign", label: "기계·시스템디자인공학과" },
        { value: "civilEnvironmental", label: "건설환경공학과" },
        { value: "basicScience", label: "기초과학과" },
    ],
    architecture: [
        { value: "architectureMajor", label: "건축학전공(5년제)" },
        { value: "interiorArchitecture", label: "실내건축학전공" },
        { value: "urbanEngineering", label: "도시공학과" },
    ],
    business: [
        { value: "management", label: "경영학전공" },
        { value: "trade", label: "무역학전공" },
    ],
    liberalArts: [
        { value: "englishLiterature", label: "영어영문학과" },
        { value: "germanLiterature", label: "독어독문학과" },
        { value: "frenchLiterature", label: "불어불문학과" },
        { value: "koreanLiterature", label: "국어국문학과" },
    ],
    law: [
        { value: "lawMajor", label: "법학부" },
    ],
    education: [
        { value: "mathEducation", label: "수학교육과" },
        { value: "koreanEducation", label: "국어교육과" },
        { value: "englishEducation", label: "영어교육과" },
        { value: "historyEducation", label: "역사교육과" },
        { value: "pedagogy", label: "교육학과" },
    ],
    fineArts: [
        { value: "undeclared", label: "자율전공" },
        { value: "orientalPainting", label: "동양화과" },
        { value: "painting", label: "회화과" },
        { value: "printmaking", label: "판화과" },
        { value: "sculpture", label: "조소과" },
        { value: "visualDesign", label: "시각디자인전공" },
        { value: "industrialDesign", label: "산업디자인전공" },
        { value: "metalArtDesign", label: "금속조형디자인과" },
        { value: "ceramicsGlass", label: "도예유리과" },
        { value: "woodFurniture", label: "목조형가구학과" },
        { value: "textileFashion", label: "섬유미술패션디자인과" },
        { value: "artStudies", label: "예술학과" },
    ],
    economics: [
        { value: "economicsMajor", label: "경제학전공" },
    ],
    designArtManagement: [
        { value: "designManagement", label: "디자인경영전공" },
        { value: "artManagement", label: "예술경영전공" },
    ],
    performingArts: [
        { value: "musical", label: "뮤지컬전공" },
        { value: "appliedMusic", label: "실용음악전공" },
    ],
    undeclaredSeoul: [
        { value: "undeclared", label: "캠퍼스자율전공" },
    ],
    convergenceSeoul: [
        { value: "performingArtsConv", label: "공연예술전공" },
        { value: "cultureArtManagement", label: "문화예술경영전공" },
        { value: "architecturalSpaceArt", label: "건축공간예술전공" },
        { value: "iot", label: "사물인터넷공학전공" },
        { value: "intelligentRobot", label: "지능로봇공학전공" },
        { value: "smartCityDataScience", label: "스마트도시데이터사이언스전공" },
        { value: "designEngineering", label: "디자인엔지니어링전공" },
        { value: "dataScience", label: "데이터사이언스전공" },
        { value: "medicalHealthcareAI", label: "의료헬스케어AI전공" },
        { value: "healthcareService", label: "헬스케어서비스전공" },
    ],
    bioHealth: [
        { value: "bioHealthDesign", label: "바이오헬스디자인전공" },
        { value: "bioHealthDevice", label: "바이오헬스디바이스전공" },
        { value: "bioHealthData", label: "바이오헬스데이터전공" },
        { value: "advancedBiotech", label: "첨단바이오테크전공" },
        { value: "bioHealthAI", label: "바이오헬스인공지능전공" },
    ],
    generalStudiesSeoul: [
        { value: "generalStudies", label: "교양과" },
    ],

    // ─── 세종캠퍼스 ───
    scienceTech: [
        { value: "undeclared", label: "자율전공" },
        { value: "electronicConvergence", label: "전자전기융합공학과" },
        { value: "softwareConvergence", label: "소프트웨어융합학과" },
        { value: "nanoMaterials", label: "나노신소재학과" },
        { value: "architecturalEngineering", label: "건축공학전공" },
        { value: "architecturalDesign", label: "건축디자인전공(5년제)" },
        { value: "mechanicalInfo", label: "기계정보공학과" },
        { value: "navalArchitecture", label: "조선해양공학과" },
        { value: "bioChemical", label: "바이오화학공학과" },
    ],
    aidScienceTech: [
        { value: "nanoSemiconductor", label: "나노반도체공학과" },
        { value: "navalMobility", label: "조선해양모빌리티공학과" },
        { value: "aiMechanical", label: "AI기계융합공학과" },
        { value: "undeclared", label: "자율전공(AID융합과기대)" },
        { value: "electronicConvergence", label: "전자전기융합공학과" },
        { value: "softwareConvergence", label: "소프트웨어융합학과" },
        { value: "architecturalEngineering", label: "건축공학전공(4년제)" },
        { value: "architecturalDesign", label: "건축디자인전공(5년제)" },
        { value: "bioChemicalConvergence", label: "바이오화학융합공학과" },
    ],
    game: [
        { value: "gameSoftware", label: "게임소프트웨어전공" },
        { value: "gameGraphicDesign", label: "게임그래픽디자인전공" },
    ],
    commerce: [
        { value: "globalBusiness", label: "글로벌경영전공" },
        { value: "accounting", label: "회계학전공" },
        { value: "financeInsurance", label: "금융보험학전공" },
    ],
    formativeArts: [
        { value: "designConvergence", label: "디자인컨버전스학부" },
        { value: "filmAnimation", label: "영상·애니메이션학부" },
    ],
    advertisingPR: [
        { value: "advertisingPRMajor", label: "광고홍보학부" },
    ],
    industrialSports: [
        { value: "industrialSportsMajor", label: "산업스포츠학과" },
    ],
    sportsCoaching: [
        { value: "sportsCoachingMajor", label: "스포츠지도학과" },
    ],
    undeclaredSejong: [
        { value: "undeclared", label: "캠퍼스자율전공" },
    ],
    convergenceSejong: [
        { value: "landscapeDesign", label: "환경조경디자인전공" },
        { value: "bigDataBusiness", label: "빅데이터비즈니스전공" },
        { value: "futureMobility", label: "미래모빌리티전공" },
    ],
    generalStudiesSejong: [
        { value: "generalStudies", label: "교양과" },
    ],
};


function SelectSection({ title, placeholder, helperText, id, options, value, onChange, disabled }) {
    return (
        <InputLayout
            id={id}
            title={title}
            children={
                <div className={styles.controlWithHelper}>
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
                    {helperText ? <p className={styles.helperText}>{helperText}</p> : null}
                </div>
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
    const submitGuardRef = useRef(false);

    const departmentOptions = DEPARTMENT_OPTIONS[college] ?? [];//// 선택된 단과대학에 딸린 학과 목록. 미선택이면 빈 배열



    function handleCollegeChange(nextCollege) {
        // 단과대학을 바꾸면 학과 선택은 초기화
        setCollege(nextCollege);
        setDepartment("");
    }


    // 제출 중 여부
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 서버가 돌려준 에러 문구와 필드별 오류를 따로 보여줘.
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

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
        fieldErrors.id || (id !== "" && !isIdValid
            ? "학번 형식이 올바르지 않습니다. (예: C123456)"
            : "");

    const passwordHelperText =
        fieldErrors.password || (password !== "" && !isPasswordValid
            ? `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자리로 입력해 주세요.`
            : "");

    const passwordConfirmHelperText =
        passwordConfirm !== "" && !isPasswordMatched
            ? "비밀번호가 일치하지 않습니다."
            : "";

    const emailHelperText =
        fieldErrors.email || (email !== "" && !isEmailValid
            ? "이메일 형식이 올바르지 않습니다. (예: hongik@g.hongik.ac.kr)"
            : "");

    const telHelperText =
        fieldErrors.tel || (tel !== "" && !isTelValid
            ? "전화번호는 '-' 없이 숫자 11자리로 입력해 주세요."
            : "");

    function clearFieldError(field) {
        setErrorMessage("");
        setFieldErrors((currentErrors) => {
            if (!currentErrors[field]) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[field];
            return nextErrors;
        });
    }

    function readServerFieldErrors(errors) {
        if (!errors || typeof errors !== "object") {
            return {};
        }

        const serverToFormField = {
            name: "name",
            studentId: "id",
            password: "password",
            email: "email",
            phoneNumber: "tel",
            college: "college",
            department: "department",
        };

        const entries = Array.isArray(errors)
            ? errors.map((item) => [
                item?.field,
                item?.message ?? item?.defaultMessage,
            ])
            : Object.entries(errors);

        return Object.fromEntries(
            entries
                .map(([serverField, message]) => [
                    serverToFormField[serverField],
                    Array.isArray(message)
                        ? message[0]
                        : (message?.message ?? message),
                ])
                .filter(([field, message]) => field && typeof message === "string"),
        );
    }



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
        if (!canSubmit || submitGuardRef.current) {
            return;
        }

        submitGuardRef.current = true;
        setErrorMessage("");
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const selectedCollege =
                COLLEGE_OPTIONS.find((option) => option.value === college)?.label ?? college;
            const selectedDepartment =
                departmentOptions.find((option) => option.value === department)?.label ?? department;
            const signupResult = await signup({
                name: name.trim(),
                id: id.trim(),
                password,
                email: email.trim(),
                tel: tel.trim(),
                college: selectedCollege,
                department: selectedDepartment,
            });


            // 가입 완료 페이지로 이동
            // replace: 뒤로가기로 가입 폼에 돌아오지 못하도록
            // state: 가입을 거쳐서 왔다는 표시 (완료 페이지에서 확인용으로 쓸 수 있음)
            navigate("/signup/complete", {
                replace: true,
                state: {
                    name: signupResult?.name ?? name.trim(),
                    id: signupResult?.loginId ?? id.trim(),
                    email: signupResult?.email ?? email.trim(),
                    college: signupResult?.college ?? selectedCollege,
                    department: signupResult?.department ?? selectedDepartment,
                },
            });
        } catch (error) {
            const nextFieldErrors = readServerFieldErrors(error?.errors);
            setFieldErrors(nextFieldErrors);
            setErrorMessage(error?.message || "회원가입에 실패했습니다.");

            if (nextFieldErrors.name || nextFieldErrors.id || nextFieldErrors.password) {
                setLastStep(false);
            }
        } finally {
            submitGuardRef.current = false;
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
            onSubmit={handleSubmit}
        >
            {lastStep === false ? (<div className={styles.innerPage}>
                <InputTextSection
                    title='이름' placeholder='이름을 입력하세요.'
                    inputName='name' id='name'
                    helperText={fieldErrors.name}
                    value={name} onChange={(event) => {
                        setName(event.target.value);
                        clearFieldError("name");
                    }}
                />
                <InputTextSection
                    title='학번' placeholder='학번을 입력하세요 (학번은 대문자로 시작합니다)'
                    helperText={idHelperText}
                    inputName='id' id='id'
                    value={id} onChange={(event) => {
                        setId(event.target.value);
                        clearFieldError("id");
                    }}
                />
                <InputTextSection
                    title='비밀번호' placeholder='비밀번호를 입력하세요 (8~16자리)'
                    inputName='password' type='password' id='password'
                    helperText={passwordHelperText}
                    value={password} onChange={(event) => {
                        setPassword(event.target.value);
                        clearFieldError("password");
                    }}
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
                        value={email} onChange={(event) => {
                            setEmail(event.target.value);
                            clearFieldError("email");
                        }}
                    />
                    <InputTextSection
                        title='전화번호' placeholder='전화번호를 입력하세요 (‘-’ 제외하고 숫자만 입력)'
                        helperText={telHelperText}
                        inputName='tel' id='tel'
                        value={tel} onChange={(event) => {
                            setTel(event.target.value);
                            clearFieldError("tel");
                        }}
                    />

                    <SelectSection
                        title="단과대학"
                        placeholder="단과대학을 선택하세요"
                        id="college"
                        options={COLLEGE_OPTIONS}
                        value={college}
                        helperText={fieldErrors.college}
                        onChange={(nextCollege) => {
                            handleCollegeChange(nextCollege);
                            clearFieldError("college");
                            clearFieldError("department");
                        }}
                        disabled={isSubmitting}
                    />

                    <SelectSection
                        title="학과"
                        placeholder="학과를 선택하세요"
                        id="department"
                        options={departmentOptions}
                        value={department}
                        helperText={fieldErrors.department}
                        onChange={(nextDepartment) => {
                            setDepartment(nextDepartment);
                            clearFieldError("department");
                        }}
                        disabled={college === "" || isSubmitting}
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
                            disabled={isSubmitting}
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

            {errorMessage ? (
                <p className={styles.submitError} role="alert">
                    {errorMessage}
                </p>
            ) : null}

            <p className={styles.returnToLogin} onClick={() => navigate('/')}>로그인 화면으로 돌아가기</p>
        </form>
    );
}

export default SignUpPage;
