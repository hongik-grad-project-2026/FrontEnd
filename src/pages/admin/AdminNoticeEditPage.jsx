import { useState } from 'react';

import { useLoaderData, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import styles from './AdminNoticeEditPage.module.css';
import ToggleButton from "../../components/common/ToggleButton";
import Textarea from "../../components/common/Textarea";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import AttachmentItem from "../../components/common/AttachmentItem";

function AdminNoticeEditPage() {
    const navigate = useNavigate();

    const noticeData = useLoaderData();

    const [form, setForm] = useState({
        title: noticeData.title,
        content: noticeData.content,
        isImportant: noticeData.isImportant,
        attachments: [...noticeData.attachments],
    });

    // console.log('=========', form);
    const isValid = form.title.trim().length > 0 && form.content.trim().length > 0;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleToggleImportant = () => {
        setForm((prev) => ({
            ...prev,
            isImportant: !prev.isImportant,
        }));
    };




    return (
        <form
            className={styles.noticeCreatePage}
        // onSubmit={handleSubmit}
        >
            <PageHeader />

            <div className={styles.noticeEditArea} >

                <div className={styles.editSection}>
                    <p className={styles.sectionTitle}>공지 설정</p>
                    <div>
                        <ToggleButton
                            status={form.isImportant}
                            onChange={handleToggleImportant}
                        />
                    </div>
                </div >

                <div className={styles.editSection}>
                    <p className={styles.sectionTitle}>제목 *</p>
                    <Input
                        height='lg' width='fill' placeholder='제목을 입력하세요.'
                        id="title" name="title" value={form.title}
                        onChange={handleChange}
                    />
                </div >

                <div className={styles.editSection}>
                    <p className={styles.sectionTitle}>내용 *</p>
                    <Textarea
                        placeholder='내용을 입력하세요.' width='100%' height='auto'
                        id="content" name="content" value={form.content}
                        onChange={handleChange}
                    />
                </div >

                <div className={styles.editSection}>
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
                            {form.attachments.map((attachment) => (
                                <AttachmentItem icon='trash' attachment={attachment} onClick={() => { alert('삭제 버튼 Click') }} />)
                            )}
                        </div>

                    </div>
                </div >


            </div>
            <div className={styles.buttonWrapper}>
                <Button
                    color="Neutral" kind="border" size="Default"
                    status="Default"
                    text="돌아가기"
                    onClick={() => navigate(`/admin/notices/${noticeData.noticeId}`)}
                />

                <Button
                    color="Primary" kind="fill" size="Default"
                    status={isValid ? 'Default' : 'Disabled'}
                    text='수정 완료'
                    type="submit"
                />
            </div>
        </form >
    );
}

export default AdminNoticeEditPage;