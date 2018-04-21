module Password.Types exposing (..)

import Dict

import Navigation.Types

type alias Model =
    { passwords : PasswordDict
    , instance : Maybe Instance
    }

type Msg
    = TriggerPassword
        (List String)
        (Maybe Navigation.Types.Msg)
        Navigation.Types.Msg
    | SetPassword String String
    | Submit
    | SubmitSuccess SubmitResponse
    | SubmitFailure
    | ToNavigation Navigation.Types.Msg
    | Cancel

type alias PasswordDict = Dict.Dict String Password
type alias SubmitResponse = List (String, Bool)

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
