import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createNotice } from '../../api/noticeApi';
import ToggleButton from "../../components/common/ToggleButton";
import Textarea from "../../components/common/Textarea";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import AttachmentItem from "../../components/common/AttachmentItem";

import styles from "./AdminNoticeCreatePage.module.css";


function AdminNoticeCreatePage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        content: '',
        isImportant: false,
        attachments: [],
    });
    const isValid = form.title.trim().length > 0 && form.content.trim().length > 0;

    // TanStack Query의 useMutation : 서버에 데이터를 보내는 create/update/delete 같은 쓰기 요청에 적합
    const createNoticeMutation = useMutation({
        // mutationFn : 실제 서버 요청을 수행하는 함수 (mock API인 createNotice를 호출)
        mutationFn: (payload) => createNotice(payload),

        // 성공 시점에 실행 : 공지 목록의 캐시를 무효화해서 목록 페이지가 최신 데이터를 다시 불러오도록
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['list-notices'] });
            navigate(-1);
        },

        // 실패 시점에 실행 : 현재는 콘솔에 에러만 남기지만, 추후 toast나 alert 등 처리 필요
        onError: (error) => {
            console.error('공지 작성 실패:', error);
        },
    });

    const handleToggleImportant = () => {
        setForm((prev) => ({
            ...prev,
            isImportant: !prev.isImportant,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isValid || createNoticeMutation.isPending) { // 이미 보내는 중이거나 유효하지 않은 상태
            return;
        }

        // 서버로 보낼 payload 정리
        const payload = {
            title: form.title.trim(), //앞뒤 공백 제거
            content: form.content.trim(),
            important: form.isImportant,
            attachments: [], //첨부파일 기능이 아직 없음
        };

        // mutate() : 서버 요청 실행
        createNoticeMutation.mutate(payload);
    };

    return (
        <form className={styles.noticeCreatePage} onSubmit={handleSubmit}>
            <PageHeader />

            <div className={styles.noticeCreateArea} >

                <div className={styles.createSection}>
                    <p className={styles.sectionTitle}>공지 설정</p>
                    <div>
                        <ToggleButton
                            status={form.isImportant}
                            onChange={handleToggleImportant}
                        />
                    </div>
                </div >

                <div className={styles.createSection}>
                    <p className={styles.sectionTitle}>제목 *</p>
                    <Input
                        height='lg' width='fill' placeholder='제목을 입력하세요.'
                        id="title" name="title" value={form.title}
                        onChange={handleChange} />
                </div >

                <div className={styles.createSection}>
                    <p className={styles.sectionTitle}>내용 *</p>
                    <Textarea
                        placeholder='내용을 입력하세요.' width='100%' height='auto'
                        id="content" name="content" value={form.content}
                        onChange={handleChange}
                    />
                </div >

                <div className={styles.createSection}>
                    <p className={styles.sectionTitle}>첨부파일</p>
                    <div className={styles.attachmentsArea}>
                        <Button
                            color="Neutral"
                            kind="border"
                            showLeftIcon={true}
                            size="Default"
                            status="Default"
                            text="파일 선택"
                        />

                        <div className={styles.attachmentsWrapper}>
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                            <AttachmentItem icon='trash' onClick={() => { alert('삭제 버튼 Click') }} />
                        </div>

                    </div>
                </div >


            </div>
            <div className={styles.buttonWrapper}>
                <Button
                    color="Neutral" kind="border" size="Default"
                    status="Default"
                    text="돌아가기"
                    onClick={() => navigate('/admin/notices')}
                />

                <Button
                    color="Primary" kind="fill" size="Default"
                    status={isValid && !createNoticeMutation.isPending ? 'Default' : 'Disabled'}
                    text='작성 완료'
                    type="submit"
                />
            </div>
        </form >
    );
}

export default AdminNoticeCreatePage;