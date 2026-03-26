export const MONGOLIAN_AIMAGS = [
	"Архангай",
	"Баян-Өлгий",
	"Баянхонгор",
	"Булган",
	"Говь-Алтай",
	"Говьсүмбэр",
	"Дархан-Уул",
	"Дорноговь",
	"Дорнод",
	"Дундговь",
	"Завхан",
	"Орхон",
	"Өвөрхангай",
	"Өмнөговь",
	"Сүхбаатар",
	"Сэлэнгэ",
	"Төв",
	"Увс",
	"Ховд",
	"Хөвсгөл",
	"Хэнтий",
	"Улаанбаатар",
] as const;

export function isValidAimag(value: string) {
	return MONGOLIAN_AIMAGS.includes(value as (typeof MONGOLIAN_AIMAGS)[number]);
}
