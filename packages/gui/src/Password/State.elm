module Password.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict

import Password.Types exposing (..)
import Navigation.Types
import Utils.State exposing
    ( with
    )
import Password.Rest exposing
    ( setPasswords
    )
import Error.Types


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
            with model model.instance <| \instance ->
                let
                    data = getSubmitData
                        instance.promptedPasswords
                        model.passwords
                    newInstance = {instance
                        | submitting = True
                        }
                    newModel = {model
                        | instance = Just newInstance
                        }
                in
                    (newModel, setPasswords data)

        SubmitSuccess response ->
            with model model.instance <| \instance ->
                let
                    newPasswords = List.foldl setPasswordFromResult model.passwords response
                    newInstance = {instance
                        | submitting = False
                        }
                    newModel = { model
                        | passwords = newPasswords
                        , instance = Just newInstance
                        }
                in
                    if allCorrect instance.promptedPasswords newPasswords then
                        ({ newModel | instance = Nothing }, Cmd.none)
                    else
                        (newModel, Cmd.none)

        SubmitFailure error ->
            with model model.instance <| \instance ->
                let
                    newInstance = {instance
                        | submitting = False
                        , error = getErrorText error
                        }
                    newModel = {model
                        | instance = Just newInstance
                        }
                in
                    (newModel, Cmd.none)

        Cancel ->
            with model (Maybe.andThen .onCancel model.instance) <| \_ ->
                let
                    newModel = { model
                        | instance = Nothing
                        }
                in
                    (newModel, Cmd.none)

        ToNavigation _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


getErrorText : Error.Types.Msg -> String
getErrorText error =
    case error of
        Error.Types.Display _ message ->
            message

        Error.Types.Dismiss ->
            ""


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


getSubmitData : List String -> PasswordDict -> List (String, String)
getSubmitData promptedPasswords passwords =
    List.concat
        <| List.map toList
        <| List.map (getSubmitPassword passwords)
        <| promptedPasswords


toList : Maybe a -> List a
toList maybe =
    case maybe of
        Just value ->
            [value]

        Nothing ->
            []


getSubmitPassword : PasswordDict -> String -> Maybe (String, String)
getSubmitPassword passwords currency =
    let
        transform password =
            case password of
                UncheckedPassword value ->
                    Just (currency, value)

                IncorrectPassword value ->
                    Just (currency, value)

                CorrectPassword _ ->
                    Nothing
    in
        Maybe.andThen transform <|
            Dict.get currency passwords


allCorrect : List String -> PasswordDict -> Bool
allCorrect promptedPasswords passwords =
    let
        predicate currency =
            case Dict.get currency passwords of
                Just password ->
                    case password of
                        CorrectPassword _ ->
                            True
                        _ ->
                            False
                Nothing ->
                    False
    in
        List.all predicate promptedPasswords


setPasswordFromResult : (String, Bool) -> PasswordDict -> PasswordDict
setPasswordFromResult (currency, correct) =
    if correct then
        setCorrectPassword currency
    else
        setIncorrectPassword currency


setIncorrectPassword : String -> PasswordDict -> PasswordDict
setIncorrectPassword currency =
    Dict.update currency <| Maybe.map <| \password ->
        case password of
            UncheckedPassword value ->
                IncorrectPassword value

            IncorrectPassword value ->
                IncorrectPassword value

            _ ->
                password


setCorrectPassword : String -> PasswordDict -> PasswordDict
setCorrectPassword currency =
    Dict.update currency <| Maybe.map <| \password ->
        case password of
            UncheckedPassword value ->
                CorrectPassword <| String.length value

            IncorrectPassword value ->
                CorrectPassword <| String.length value

            _ ->
                password
