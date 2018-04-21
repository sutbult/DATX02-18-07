module Password.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict

import Password.Types exposing (..)
import Navigation.Types
import Utils.Maybe exposing
    ( isJust
    )


init : (Model, Cmd Msg)
init =
    let
        model =
            { passwords = Dict.fromList
                [ ("BTC", UncheckedPassword "")
                , ("ETH", CorrectPassword 10)
                , ("ETC", IncorrectPassword "foobar")
                ]
            , instance = Just
                { promptedPasswords =
                    [ "BTC"
                    , "ETH"
                    , "ETC"
                    ]
                , submitting = False
                , error = ""
                , onSuccess = Navigation.Types.Show Navigation.Types.Settings
                , onCancel = Just <|
                    Navigation.Types.Show Navigation.Types.Wallet
                }
            }
    in
        (model , Cmd.none)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        SetPassword currency value ->
            let
                newModel =
                    { model
                        | passwords = replacePassword
                            currency value
                            model.passwords
                    }
            in
                (newModel, Cmd.none)

        TriggerPassword _ _ _ ->
            (model, Cmd.none)

        Submit ->
            (model, Cmd.none)

        SubmitSuccess ->
            let
                newModel = { model
                    | instance = Nothing
                    }
            in
                (newModel, Cmd.none)

        SubmitFailure ->
            (model, Cmd.none)

        Cancel ->
            if isJust <| Maybe.andThen .onCancel model.instance then
                let
                    newModel = { model
                        | instance = Nothing
                        }
                in
                    (newModel, Cmd.none)

            else
                (model, Cmd.none)

        ToNavigation _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


replacePassword : String -> String -> PasswordDict -> PasswordDict
replacePassword currency value =
    Dict.update currency <| Maybe.map <| \password ->
        case password of
            UncheckedPassword _ ->
                UncheckedPassword value

            IncorrectPassword _ ->
                UncheckedPassword value

            CorrectPassword len ->
                CorrectPassword len
