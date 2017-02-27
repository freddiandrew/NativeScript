﻿import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty
} from "./date-picker-common";

export * from "./date-picker-common";

interface DateChangedListener {
    new (owner: DatePicker): android.widget.DatePicker.OnDateChangedListener;
}

let DateChangedListener: DateChangedListener;

function initializeDateChangedListener(): void {
    if (DateChangedListener) {
        return;
    }

    @Interfaces([android.widget.DatePicker.OnDateChangedListener])
    class DateChangedListenerImpl extends java.lang.Object implements android.widget.DatePicker.OnDateChangedListener {
        constructor(public owner: DatePicker) {
            super()
            return global.__native(this);
        }

        onDateChanged(picker: android.widget.DatePicker, year: number, month: number, day: number) {
            const owner = this.owner;
            let dateIsChanged = false;
            if (year !== owner.year) {
                yearProperty.nativeValueChange(owner, year);
                dateIsChanged = true;
            }

            if ((month + 1) !== owner.month) {
                monthProperty.nativeValueChange(owner, month + 1);
                dateIsChanged = true;
            }

            if (day !== owner.day) {
                dayProperty.nativeValueChange(owner, day);
                dateIsChanged = true;
            }

            if (dateIsChanged) {
                dateProperty.nativeValueChange(owner, new Date(year, month, day));
            }
        }
    }

    DateChangedListener = DateChangedListenerImpl;
}

export class DatePicker extends DatePickerBase {
    private _android: android.widget.DatePicker;
    public _listener: android.widget.DatePicker.OnDateChangedListener;

    get android(): android.widget.DatePicker {
        return this._android;
    }

    public _createNativeView() {
        initializeDateChangedListener();
        this._android = new android.widget.DatePicker(this._context);
        this._android.setCalendarViewShown(false);
        this._listener = this._listener = new DateChangedListener(this);
        this._android.init(0, 0, 0, this._listener);
    }

    private updateNativeDate(): void {
        const year = typeof this.year === "number" ? this.year : this.android.getYear();
        const month = typeof this.month === "number" ? (this.month - 1) : this.android.getMonth();
        const day = typeof this.day === "number" ? this.day : this.android.getDayOfMonth();
        this.date = new Date(year, month, day);
    }

    get [yearProperty.native](): number {
        return this.android.getYear();
    }
    set [yearProperty.native](value: number) {
        if (this.android.getYear() !== value) {
            this.updateNativeDate();
        }
    }

    get [monthProperty.native](): number {
        return this.android.getMonth();
    }
    set [monthProperty.native](value: number) {
        if (this.android.getMonth() !== (value - 1)) {
            this.updateNativeDate();
        }
    }

    get [dayProperty.native](): number {
        return this.android.getDayOfMonth();
    }
    set [dayProperty.native](value: number) {
        if (this.android.getDayOfMonth() !== value) {
            this.updateNativeDate();
        }
    }

    get [dateProperty.native](): Date {
        return new Date(this.android.getYear(), this.android.getMonth(), this.android.getDayOfMonth());
    }
    set [dateProperty.native](value: Date) {
        if (this.android.getDayOfMonth() !== value.getDay()
            || this.android.getMonth() !== value.getMonth()
            || this.android.getYear() !== value.getFullYear()) {
            this.android.updateDate(value.getFullYear(), value.getMonth(), value.getDate());
        }
    }

    get [maxDateProperty.native](): Date {
        return this.android.getMaxDate();
    }
    set [maxDateProperty.native](value: Date) {
        let newValue = value.getTime();
        if (this.android.getMaxDate() !== newValue) {
            this.android.setMaxDate(newValue);
        }
    }

    get [minDateProperty.native](): Date {
        return this.android.getMinDate();
    }
    set [minDateProperty.native](value: Date) {
        let picker = this.android;
        let newValue = value.getTime();
        if (picker.getMinDate() !== newValue) {
            picker.setMinDate(newValue);
        }
    }
}