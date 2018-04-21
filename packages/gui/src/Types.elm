module Types exposing (..)

import Navigation.Types
import Password.Types

type alias Model =
    { navigation : Navigation.Types.Model
    , password : Password.Types.Model
    }

type Msg
    = ToNavigation Navigation.Types.Msg
    | ToPassword Password.Types.Msg
    | PasswordCancel
    | PasswordSubmitSuccess Password.Types.SubmitResponse


mapPasswordCmd : Password.Types.Msg -> Msg
mapPasswordCmd msg =
    case msg of
        Password.Types.Cancel ->
            PasswordCancel

        Password.Types.SubmitSuccess response ->
            PasswordSubmitSuccess response

        _ ->
            ToPassword msg
