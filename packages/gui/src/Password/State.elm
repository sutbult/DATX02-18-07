module Password.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict

import Password.Types exposing (..)


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
                , onCancel = Nothing
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
