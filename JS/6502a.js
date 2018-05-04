var loadAccWithConst = "A9"; /* LDA - Load the accumulator with a constant */
var loadAccFromMemo  = "AD"; /* LDA - Load the accumulator from memory */
var storeAccInMemo   = "8D"; /* STA - Store the accumulator in memory */
var addWithCarry     = "6D"; /* ADC - Adds contents of an address to the accumulator and keeps the result in the accumulator */
var loadXWithConst   = "A2"; /* LDX - Load the X register with a constant */
var loadXFromMemo    = "AE"; /* LDX - Load the X register from memory */
var loadYWithConst   = "A0"; /* LDY - Load the Y register with a constant */
var loadYFromMemo    = "AC"; /* LDY - Load the Y register from memory */
var noOperation      = "EA"; /* NOP - No Operation */
var breakOp          = "00"; /* BRK - Break (which is really a system call) */
var compareMemoToX   = "EC"; /* CPX - Compare a byte in memory to the X register. Sets the Z  (zero) flag if equal */
var branchNBytes     = "D0"; /* BNE - Branch n bytes if z flag = 0 */
var increment        = "EE"; /* INC - Increment the value of a byte */
var systemCall       = "FF"; /* SYS - System Call */
var printInt         = "01"; /* #$01 in X reg = print the integer stored in the Y register. */
var PrintStr         = "02"; /* #$02 in X reg = print the 00-terminated */