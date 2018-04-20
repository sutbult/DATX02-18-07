module Password.Types exposing (..)

import Dict

import Navigation.Types

type alias Model =
    { passwords : Dict.Dict String Password
    , instance : Maybe Instance
    }

type Msg
    = TriggerPassword
        List String
        (Maybe Navigation.Types.Msg)
        Navigation.Types.Msg
    | SetPassword String String
    | Submit

type Password
    = UncheckedPassword String
    | IncorrectPassword String
    | CorrectPassword Int

type alias Instance =
    { promptedPasswords : List String
    , onSuccess : Navigation.Types.Msg
    , onCancel : Maybe Navigation.Types.Msg
    , submitting : Bool
    , error : String
    }
