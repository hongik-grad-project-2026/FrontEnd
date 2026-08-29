import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Dropdown.module.css';
import Button from './Button';
import { InputIconButton } from './IconButton';


function DropdownItems({ items, setSelectedValue, selectedValue }) {
    const handeleSelectValue = (item) => {
        if (item === selectedValue) {
            setSelectedValue('')
        } else {
            setSelectedValue(item)
        }
    }

    return (
        <div className={styles.dropdownItems}>
            {items.map((item, index) => {
                return (
                    <Button
                        text={item}
                        key={`item${index}`}
                        kind='border'
                        size='Xsmall'
                        status={selectedValue === item ? "Active" : "Default"}
                        onClick={() => handeleSelectValue(item)}
                    />
                )
            })}
        </div>
    )
}

function DropdownCalender(setSelectedValue, selectedValue) {
    return (
        <div className={styles.dropdownCalendar}>

            <Calendar />
        </div>
    )
}

function Dropdown({
    type = 'list', // list | calendar
    placeHolder = '선택하세요',
    items = ['선택 1', '선택 2', '선택 3', '선택 4', '선택 5', '선택 6', '선택 7', '선택 8',]
}) {
    const [selectedValue, setSelectedValue] = useState('');
    const [isOpen, setIsOpen] = useState(true);


    return (
        <div
            className={styles.dropdown}
            data-isopen={isOpen ? true : false}
        >
            <div
                className={styles.dropdownTrigger}
                onClick={() => setIsOpen(!isOpen)}
                data-active={selectedValue === '' ? false : true}
            >
                <span>
                    {selectedValue || placeHolder}
                </span>
                <InputIconButton
                    icon={isOpen ? "up" : 'down'}
                    ariaLabel="선택"
                    type="submit"
                />
            </div>
            <div className={styles.dropdownItemsWrapper} data-isopen={isOpen ? true : false}>
                {type === 'list' && <DropdownItems items={items} setSelectedValue={setSelectedValue} selectedValue={selectedValue} />}
                {type === 'calendar' && <DropdownCalender />}
            </div>
        </div>
    );
}

export default Dropdown;