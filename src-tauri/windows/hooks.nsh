; A new version must always end up running.
; - Manual install: start the app here. If the finish page starts it too, the single-instance
;   check just opens settings, which is visible feedback.
; - Electron 0.1.x updates with "--updated /S --force-run".
; - The Tauri updater passes /P and restarts the app by itself, so skip it there.
!macro NSIS_HOOK_POSTINSTALL
  ClearErrors
  ${GetOptions} $CMDLINE "/P" $0
  ${If} ${Errors}
    ${If} ${Silent}
      ClearErrors
      ${GetOptions} $CMDLINE "--force-run" $0
      ${IfNot} ${Errors}
        Exec '"$INSTDIR\Vocapeek.exe"'
      ${EndIf}
    ${Else}
      Exec '"$INSTDIR\Vocapeek.exe"'
    ${EndIf}
  ${EndIf}
!macroend
